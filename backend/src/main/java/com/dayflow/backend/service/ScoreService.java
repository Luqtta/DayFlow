package com.dayflow.backend.service;

import com.dayflow.backend.model.Task;
import com.dayflow.backend.model.User;
import com.dayflow.backend.repository.TaskRepository;
import com.dayflow.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ScoreService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    private static final ZoneId BRASILIA = ZoneId.of("America/Sao_Paulo");

    private LocalDate toBrasiliaDate(LocalDateTime dt) {
        if (dt == null) return null;
        return dt.atZone(ZoneId.of("UTC")).withZoneSameInstant(BRASILIA).toLocalDate();
    }

    private LocalDate todayBrasilia() {
        return LocalDateTime.now().atZone(ZoneId.of("UTC")).withZoneSameInstant(BRASILIA).toLocalDate();
    }

    public Map<String, Object> calculateScore(Long userId) {
        List<Task> tasks = taskRepository.findByUserId(userId);

        if (tasks.isEmpty()) {
            return buildResult(0, 0, 0, 0, "D");
        }

        // Agrupa tarefas por data usando fuso de Brasília
        Map<LocalDate, List<Task>> tasksByDate = new HashMap<>();
        for (Task task : tasks) {
            LocalDate date = null;
            if (task.isRecurrent() && task.getCompletedAt() != null) {
                date = toBrasiliaDate(task.getCompletedAt());
            } else if (task.getDueDate() != null) {
                date = task.getDueDate();
            }
            if (date != null) {
                tasksByDate.computeIfAbsent(date, k -> new ArrayList<>()).add(task);
            }
        }

        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(Task::isCompleted).count();
        double avgPercentage = (double) completedTasks / totalTasks * 100;

        long perfectDays = tasksByDate.values().stream()
                .filter(dayTasks -> dayTasks.stream().allMatch(Task::isCompleted))
                .count();

        int streak = calculateStreak(tasksByDate);

        double streakScore = Math.min((double) streak / 30 * 100, 100);
        double perfectScore = Math.min((double) perfectDays / 30 * 100, 100);
        double finalScore = (avgPercentage * 0.4) + (streakScore * 0.4) + (perfectScore * 0.2);
        int score = (int) Math.round(finalScore);

        String grade = calculateGrade(score);
        return buildResult(score, streak, (int) perfectDays, (int) avgPercentage, grade);
    }

    private int calculateStreak(Map<LocalDate, List<Task>> tasksByDate) {
        if (tasksByDate.isEmpty()) return 0;
        LocalDate today = todayBrasilia();
        int streak = 0;
        LocalDate current = today;
        while (true) {
            List<Task> dayTasks = tasksByDate.get(current);
            if (dayTasks == null || dayTasks.stream().noneMatch(Task::isCompleted)) break;
            streak++;
            current = current.minusDays(1);
        }
        return streak;
    }

    private String calculateGrade(int score) {
        if (score >= 90) return "S";
        if (score >= 75) return "A";
        if (score >= 55) return "B";
        if (score >= 35) return "C";
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