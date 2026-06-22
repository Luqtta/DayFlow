package com.dayflow.backend.service;

import com.dayflow.backend.dto.DailyProgress;
import com.dayflow.backend.dto.HistoryPage;
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
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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

    private LocalDate firstScheduledDate(Task task, LocalDate today) {
        if (task.getDueDate() != null) return task.getDueDate();

        LocalDate createdDate = createdAtToBrasiliaDate(task.getCreatedAt());
        if (createdDate == null) createdDate = today;

        if (task.isRecurrent()) return createdDate;

        String recurrenceDays = task.getRecurrenceDays();
        if (recurrenceDays != null && !recurrenceDays.trim().isEmpty()) {
            LocalDate cursor = createdDate;
            for (int i = 0; i < 7; i++) {
                if (matchesRecurrenceDay(task, cursor)) return cursor;
                cursor = cursor.plusDays(1);
            }
            return createdDate;
        }

        // Fallback for routine tasks without days
        return createdDate;
    }

    private LocalDate computeHistoryStart(List<Task> tasks, LocalDate today) {
        LocalDate first = null;
        for (Task task : tasks) {
            LocalDate candidate = firstScheduledDate(task, today);
            if (candidate == null) continue;
            if (candidate.isAfter(today)) continue;
            if (first == null || candidate.isBefore(first)) first = candidate;
        }
        return first;
    }

    /**
     * Nucleo do calculo de estatisticas diarias. Trabalha sobre dados ja carregados
     * (tasks + completions), sem tocar no banco — assim o ranking pode reaproveitar
     * com dados em lote e eliminar o N+1.
     */
    private Map<LocalDate, DayStats> computeDailyStats(List<Task> tasks,
                                                       List<TaskCompletion> completions,
                                                       LocalDate start, LocalDate end) {
        Map<LocalDate, DayStats> stats = new LinkedHashMap<>();
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            stats.put(cursor, new DayStats());
            cursor = cursor.plusDays(1);
        }

        for (Map.Entry<LocalDate, DayStats> entry : stats.entrySet()) {
            LocalDate date = entry.getKey();
            DayStats day = entry.getValue();
            for (Task task : tasks) {
                if (isScheduledOnDate(task, date)) day.total++;
            }
        }

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
            if (legacyDate.isBefore(start) || legacyDate.isAfter(end)) continue;
            String key = task.getId() + "|" + legacyDate;
            if (completionKeys.contains(key)) continue;

            DayStats day = stats.get(legacyDate);
            if (day != null && isScheduledOnDate(task, legacyDate)) {
                day.completed++;
            }
        }

        return stats;
    }

    private Map<LocalDate, DayStats> buildDailyStatsRange(Long userId, LocalDate start, LocalDate end, List<Task> tasks) {
        List<TaskCompletion> completions = taskCompletionRepository
                .findByTaskUserIdAndCompletedDateBetween(userId, start, end);
        return computeDailyStats(tasks, completions, start, end);
    }

    private Map<LocalDate, DayStats> buildDailyStats(Long userId, int days) {
        int safeDays = Math.max(1, days);
        LocalDate today = todayBrasilia();
        LocalDate start = today.minusDays(safeDays - 1);

        List<Task> tasks = taskRepository.findByUserId(userId);
        List<TaskCompletion> completions = taskCompletionRepository
                .findByTaskUserIdAndCompletedDateBetween(userId, start, today);
        return computeDailyStats(tasks, completions, start, today);
    }

    public Map<String, Object> calculateScore(Long userId) {
        return scoreFromStats(buildDailyStats(userId, WINDOW_DAYS));
    }

    // Mesma formula de pontuacao, mas a partir de stats ja calculadas (reaproveitado pelo ranking)
    private Map<String, Object> scoreFromStats(Map<LocalDate, DayStats> stats) {
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

    /**
     * Returns exactly 7 DailyProgress entries for the week window defined by weekOffset.
     * weekOffset=0 → last 7 days (today-6 to today)
     * weekOffset=1 → today-13 to today-7
     * All 7 days are returned, including days with total=0 (no tasks scheduled).
     */
    public List<DailyProgress> getWeeklyProgress(Long userId, int weekOffset) {
        int safeOffset = Math.max(0, weekOffset);
        LocalDate today = todayBrasilia();
        LocalDate end = today.minusDays((long) safeOffset * 7);
        LocalDate start = end.minusDays(6);

        List<Task> tasks = taskRepository.findByUserId(userId);
        Map<LocalDate, DayStats> stats = buildDailyStatsRange(userId, start, end, tasks);

        List<DailyProgress> result = new ArrayList<>();
        for (Map.Entry<LocalDate, DayStats> entry : stats.entrySet()) {
            DayStats day = entry.getValue();
            int percentage = day.total == 0 ? 0 : (int) Math.round(((double) day.completed / day.total) * 100);
            result.add(new DailyProgress(entry.getKey(), day.total, day.completed, percentage));
        }
        result.sort((a, b) -> a.getDate().compareTo(b.getDate()));
        return result;
    }

    /**
     * Paginacao por janela de calendario direto no banco: cada pagina carrega apenas
     * as completions da sua janela (safeSize dias), em vez de computar todo o historico
     * e fatiar com subList. page=0 = ultimos safeSize dias, page=1 = janela anterior, etc.
     */
    public HistoryPage getHistoryPage(Long userId, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);
        LocalDate today = todayBrasilia();

        List<Task> tasks = taskRepository.findByUserId(userId);
        if (tasks.isEmpty()) {
            return new HistoryPage(new ArrayList<>(), safePage, safeSize, 0, false);
        }

        LocalDate windowEnd = today.minusDays((long) safePage * safeSize);
        LocalDate windowStart = windowEnd.minusDays(safeSize - 1L);

        // Carrega do banco apenas as completions desta janela (query paginada por data)
        List<TaskCompletion> completions = taskCompletionRepository
                .findByTaskUserIdAndCompletedDateBetween(userId, windowStart, windowEnd);
        Map<LocalDate, DayStats> stats = computeDailyStats(tasks, completions, windowStart, windowEnd);

        List<DailyProgress> items = new ArrayList<>();
        for (Map.Entry<LocalDate, DayStats> entry : stats.entrySet()) {
            DayStats day = entry.getValue();
            if (day.total == 0) continue;
            int percentage = (int) Math.round(((double) day.completed / day.total) * 100);
            items.add(new DailyProgress(entry.getKey(), day.total, day.completed, percentage));
        }
        items.sort((a, b) -> b.getDate().compareTo(a.getDate()));

        LocalDate historyStart = computeHistoryStart(tasks, today);
        boolean hasMore = historyStart != null && historyStart.isBefore(windowStart);
        int total = historyStart == null ? 0 : (int) (ChronoUnit.DAYS.between(historyStart, today) + 1);

        return new HistoryPage(items, safePage, safeSize, total, hasMore);
    }

    /**
     * Ranking global. Carrega tasks e completions de TODOS os usuarios em lote (3 queries
     * no total) em vez do antigo loop O(usuarios x tasks x 30 dias) com N+1 por usuario.
     * Paginacao opt-in: size <= 0 retorna a lista completa (o Dashboard precisa do ranking
     * inteiro para localizar a posicao do usuario logado por email).
     */
    public List<Map<String, Object>> getRanking(int page, int size) {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) return new ArrayList<>();

        List<Long> userIds = users.stream().map(User::getId).toList();
        LocalDate today = todayBrasilia();
        LocalDate start = today.minusDays(WINDOW_DAYS - 1L);

        List<Task> allTasks = taskRepository.findByUserIdIn(userIds);
        List<TaskCompletion> allCompletions = taskCompletionRepository
                .findByTaskUserIdInAndCompletedDateBetween(userIds, start, today);

        Map<Long, List<Task>> tasksByUser = allTasks.stream()
                .collect(Collectors.groupingBy(t -> t.getUser().getId()));
        Map<Long, Long> taskToUser = allTasks.stream()
                .collect(Collectors.toMap(Task::getId, t -> t.getUser().getId()));
        Map<Long, List<TaskCompletion>> completionsByUser = allCompletions.stream()
                .collect(Collectors.groupingBy(c -> taskToUser.getOrDefault(c.getTask().getId(), -1L)));

        List<Map<String, Object>> ranking = new ArrayList<>();
        for (User user : users) {
            List<Task> userTasks = tasksByUser.getOrDefault(user.getId(), List.of());
            List<TaskCompletion> userCompletions = completionsByUser.getOrDefault(user.getId(), List.of());
            Map<LocalDate, DayStats> stats = computeDailyStats(userTasks, userCompletions, start, today);

            Map<String, Object> score = scoreFromStats(stats);
            score.put("name", user.getName());
            score.put("email", user.getEmail());
            score.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
            ranking.add(score);
        }

        ranking.sort((a, b) -> (int) b.get("score") - (int) a.get("score"));
        for (int i = 0; i < ranking.size(); i++) {
            ranking.get(i).put("position", i + 1);
        }

        // size <= 0 => sem paginacao (compatibilidade com o frontend atual)
        if (size <= 0) return ranking;
        int safePage = Math.max(0, page);
        int from = safePage * size;
        if (from >= ranking.size()) return new ArrayList<>();
        int to = Math.min(from + size, ranking.size());
        return new ArrayList<>(ranking.subList(from, to));
    }
}
