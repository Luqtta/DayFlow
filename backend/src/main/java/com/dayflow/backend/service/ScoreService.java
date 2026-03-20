package com.dayflow.backend.service;

import com.dayflow.backend.dto.DailyProgress;
import com.dayflow.backend.model.Task;
import com.dayflow.backend.model.TaskCompletion;
import com.dayflow.backend.model.User;
import com.dayflow.backend.repository.TaskCompletionRepository;
import com.dayflow.backend.repository.TaskRepository;
import com.dayflow.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ScoreService {

    private static final ZoneId BRASILIA = ZoneId.of("America/Sao_Paulo");
    private static final ZoneId UTC = ZoneId.of("UTC");
    private static final int WINDOW_DAYS = 30;
    private static final double STREAK_THRESHOLD = 0.70;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskCompletionRepository taskCompletionRepository;

    @Autowired
    private UserRepository userRepository;

    private static class DayStats {
        int total;
        int completed;

        double completionRate() {
            return total == 0 ? 0 : (double) completed / total;
        }
    }

    private LocalDate toBrasiliaDate(LocalDateTime dt) {
        if (dt == null) return null;
        return dt.atZone(UTC).withZoneSameInstant(BRASILIA).toLocalDate();
    }

    private LocalDate createdAtToBrasiliaDate(LocalDateTime createdAt) {
        if (createdAt == null) return null;
        return createdAt.atZone(UTC).withZoneSameInstant(BRASILIA).toLocalDate();
    }

    private LocalDate todayBrasilia() {
        return LocalDate.now(BRASILIA);
    }

    private Set<Integer> parseRecurrenceDays(String raw) {
        if (raw == null || raw.trim().isEmpty()) return Set.of();
        Set<Integer> result = new HashSet<>();
        for (String part : raw.split(",")) {
            try {
                int day = Integer.parseInt(part.trim());
                if (day >= 1 && day <= 7) result.add(day);
            } catch (NumberFormatException ignored) {
                // ignore invalid values
            }
        }
        return result;
    }

    private boolean matchesRecurrenceDay(Task task, LocalDate date) {
        if (task.getRecurrenceDays() == null || task.getRecurrenceDays().trim().isEmpty()) return false;
        int day = date.getDayOfWeek().getValue();
        return parseRecurrenceDays(task.getRecurrenceDays()).contains(day);
    }

    private boolean isOnOrAfterCreation(Task task, LocalDate date) {
        LocalDate createdDate = createdAtToBrasiliaDate(task.getCreatedAt());
        if (createdDate == null) return true;
        return !date.isBefore(createdDate);
    }

    private boolean isScheduledOnDate(Task task, LocalDate date) {
        if (!isOnOrAfterCreation(task, date)) return false;
        if (task.getDueDate() != null) return task.getDueDate().equals(date);
        if (task.isRecurrent()) return true;

        String recurrenceDays = task.getRecurrenceDays();
        if (recurrenceDays != null && !recurrenceDays.trim().isEmpty()) {
            return matchesRecurrenceDay(task, date);
        }

        // Fallback for routine tasks without days (prevents "disappearing")
        return !task.isAgendaEvent();
    }

    private Map<LocalDate, DayStats> buildDailyStats(Long userId, int days) {
        int safeDays = Math.max(1, days);
        LocalDate today = todayBrasilia();
        LocalDate start = today.minusDays(safeDays - 1);

        Map<LocalDate, DayStats> stats = new LinkedHashMap<>();
        LocalDate cursor = start;
        while (!cursor.isAfter(today)) {
            stats.put(cursor, new DayStats());
            cursor = cursor.plusDays(1);
        }

        List<Task> tasks = taskRepository.findByUserId(userId);
        if (tasks.isEmpty()) return stats;

        for (Map.Entry<LocalDate, DayStats> entry : stats.entrySet()) {
            LocalDate date = entry.getKey();
            DayStats day = entry.getValue();
            for (Task task : tasks) {
                if (isScheduledOnDate(task, date)) day.total++;
            }
        }

        List<TaskCompletion> completions = taskCompletionRepository
                .findByTaskUserIdAndCompletedDateBetween(userId, start, today);
        Set<String> completionKeys = new HashSet<>();
        for (TaskCompletion completion : completions) {
            LocalDate date = completion.getCompletedDate();
            Task task = completion.getTask();
            completionKeys.add(task.getId() + "|" + date);

            DayStats day = stats.get(date);
            if (day != null && isScheduledOnDate(task, date)) {
                day.completed++;
            }
        }

        // Legacy fallback for old completions (before task_completions table)
        for (Task task : tasks) {
            LocalDate legacyDate = toBrasiliaDate(task.getCompletedAt());
            if (legacyDate == null) continue;
            if (legacyDate.isBefore(start) || legacyDate.isAfter(today)) continue;
            String key = task.getId() + "|" + legacyDate;
            if (completionKeys.contains(key)) continue;

            DayStats day = stats.get(legacyDate);
            if (day != null && isScheduledOnDate(task, legacyDate)) {
                day.completed++;
            }
        }

        return stats;
    }

    public Map<String, Object> calculateScore(Long userId) {
        Map<LocalDate, DayStats> stats = buildDailyStats(userId, WINDOW_DAYS);

        int totalTasks = stats.values().stream().mapToInt(s -> s.total).sum();
        int completedTasks = stats.values().stream().mapToInt(s -> s.completed).sum();
        int activeDays = (int) stats.values().stream().filter(s -> s.total > 0).count();
        int perfectDays = (int) stats.values().stream().filter(s -> s.total > 0 && s.completed == s.total).count();

        double avgCompletion = totalTasks == 0 ? 0 : (double) completedTasks / totalTasks;
        double coverage = (double) activeDays / WINDOW_DAYS;

        int streak = calculateStreak(stats);

        double avgScore = avgCompletion * 100 * 0.60 * coverage;
        double streakScore = ((double) streak / WINDOW_DAYS) * 100 * 0.25;
        double perfectScore = ((double) perfectDays / WINDOW_DAYS) * 100 * 0.15;
        int score = (int) Math.round(avgScore + streakScore + perfectScore);
        score = Math.max(0, Math.min(100, score));

        int avgPercentage = (int) Math.round(avgCompletion * 100);
        String grade = calculateGrade(score);
        return buildResult(score, streak, perfectDays, avgPercentage, grade);
    }

    private int calculateStreak(Map<LocalDate, DayStats> stats) {
        if (stats.isEmpty()) return 0;
        LocalDate today = todayBrasilia();
        int streak = 0;
        LocalDate current = today;
        while (true) {
            DayStats day = stats.get(current);
            if (day == null || day.total == 0) break;
            if (day.completionRate() < STREAK_THRESHOLD) break;
            streak++;
            current = current.minusDays(1);
        }
        return streak;
    }

    private String calculateGrade(int score) {
        if (score >= 90) return "S";
        if (score >= 75) return "A";
        if (score >= 55) return "B";
        if (score >= 30) return "C";
        return "D";
    }

    private Map<String, Object> buildResult(int score, int streak, int perfectDays, int avgPercentage, String grade) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("score", score);
        result.put("grade", grade);
        result.put("streak", streak);
        result.put("perfectDays", perfectDays);
        result.put("avgPercentage", avgPercentage);
        return result;
    }

    public List<DailyProgress> getHistory(Long userId, int days) {
        Map<LocalDate, DayStats> stats = buildDailyStats(userId, days);
        List<DailyProgress> result = new ArrayList<>();

        for (Map.Entry<LocalDate, DayStats> entry : stats.entrySet()) {
            DayStats day = entry.getValue();
            int percentage = day.total == 0 ? 0 : (int) Math.round(((double) day.completed / day.total) * 100);
            result.add(new DailyProgress(entry.getKey(), day.total, day.completed, percentage));
        }

        result.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        return result;
    }

    public List<Map<String, Object>> getRanking() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> ranking = new ArrayList<>();

        for (User user : users) {
            Map<String, Object> score = calculateScore(user.getId());
            score.put("name", user.getName());
            score.put("email", user.getEmail());
            score.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
            ranking.add(score);
        }

        ranking.sort((a, b) -> (int) b.get("score") - (int) a.get("score"));

        for (int i = 0; i < ranking.size(); i++) {
            ranking.get(i).put("position", i + 1);
        }

        return ranking;
    }
}
