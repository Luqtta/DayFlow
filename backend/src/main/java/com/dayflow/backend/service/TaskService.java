package com.dayflow.backend.service;

import com.dayflow.backend.dto.TaskRequest;
import com.dayflow.backend.model.Routine;
import com.dayflow.backend.model.Task;
import com.dayflow.backend.model.User;
import com.dayflow.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private RoutineService routineService;

    // Converte completedAt (UTC no banco) para data no fuso de Brasília
    private LocalDate completedAtToBrasiliaDate(LocalDateTime completedAt) {
        if (completedAt == null) return null;
        return completedAt.atZone(ZoneId.of("UTC"))
                .withZoneSameInstant(ZoneId.of("America/Sao_Paulo"))
                .toLocalDate();
    }

    private LocalDate createdAtToBrasiliaDate(LocalDateTime createdAt) {
        if (createdAt == null) return null;
        return createdAt.atZone(ZoneId.of("UTC"))
                .withZoneSameInstant(ZoneId.of("America/Sao_Paulo"))
                .toLocalDate();
    }

    private String normalizeRecurrenceDays(List<Integer> days) {
        if (days == null || days.isEmpty()) return null;
        Set<Integer> unique = new HashSet<>();
        for (Integer day : days) {
            if (day == null) continue;
            if (day < 1 || day > 7) continue;
            unique.add(day);
        }
        if (unique.isEmpty()) return null;
        List<Integer> sorted = new ArrayList<>(unique);
        Collections.sort(sorted);
        return sorted.stream().map(String::valueOf).collect(Collectors.joining(","));
    }

    private Set<Integer> parseRecurrenceDays(String raw) {
        if (raw == null || raw.trim().isEmpty()) return Collections.emptySet();
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

    private void resetIfCompletedOnAnotherDay(Task task, LocalDate today) {
        LocalDate completedDate = completedAtToBrasiliaDate(task.getCompletedAt());
        if (completedDate != null && !completedDate.equals(today)) {
            task.setCompleted(false);
            taskRepository.save(task);
        }
    }

    private Task copyForDate(Task task, LocalDate date) {
        Task copy = new Task();
        copy.setId(task.getId());
        copy.setTitle(task.getTitle());
        copy.setDescription(task.getDescription());
        copy.setRecurrent(task.isRecurrent());
        copy.setRecurrenceDays(task.getRecurrenceDays());
        copy.setDueTime(task.getDueTime());
        copy.setAgendaEvent(task.isAgendaEvent());
        copy.setRoutine(task.getRoutine());
        copy.setUser(task.getUser());

        LocalDate completedDate = completedAtToBrasiliaDate(task.getCompletedAt());
        copy.setCompleted(completedDate != null && completedDate.equals(date));
        return copy;
    }

    private boolean isOnOrAfterCreation(Task task, LocalDate date) {
        LocalDate createdDate = createdAtToBrasiliaDate(task.getCreatedAt());
        if (createdDate == null) return true;
        return !date.isBefore(createdDate);
    }

    public Task create(TaskRequest request, String email) {
        User user = userService.findByEmail(email);

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setRecurrent(request.isRecurrent());
        task.setAgendaEvent(request.isAgendaEvent());
        task.setDueTime(request.getDueTime());
        task.setUser(user);
        task.setRecurrenceDays(normalizeRecurrenceDays(request.getRecurrenceDays()));

        if (request.isAgendaEvent()) {
            task.setDueDate(request.getDueDate());
            task.setRecurrent(false);
            task.setRecurrenceDays(null);
        } else {
            Routine routine = routineService.findById(request.getRoutineId(), email);
            task.setRoutine(routine);
            task.setDueDate(null);
            if (request.isRecurrent()) {
                task.setRecurrenceDays(null);
            }
        }

        return taskRepository.save(task);
    }

    public List<Task> findToday(String email, LocalDate today) {
        User user = userService.findByEmail(email);

        List<Task> todayTasks = taskRepository.findByUserIdAndDueDate(user.getId(), today).stream()
                .filter(task -> isOnOrAfterCreation(task, today))
                .collect(Collectors.toList());
        List<Task> recurrentTasks = taskRepository.findByUserIdAndRecurrent(user.getId(), true).stream()
                .filter(task -> isOnOrAfterCreation(task, today))
                .collect(Collectors.toList());
        List<Task> weeklyTasks = taskRepository.findByUserIdAndRecurrenceDaysIsNotNull(user.getId());

        recurrentTasks.forEach(task -> resetIfCompletedOnAnotherDay(task, today));

        List<Task> matchingWeekly = weeklyTasks.stream()
                .filter(task -> matchesRecurrenceDay(task, today))
                .filter(task -> isOnOrAfterCreation(task, today))
                .collect(Collectors.toList());
        matchingWeekly.forEach(task -> resetIfCompletedOnAnotherDay(task, today));

        List<Task> result = new ArrayList<>(todayTasks);
        result.addAll(recurrentTasks);
        result.addAll(matchingWeekly);
        return result;
    }

    public List<Task> findByDate(String email, LocalDate date, LocalDate today) {
        User user = userService.findByEmail(email);

        List<Task> dateTasks = taskRepository.findByUserIdAndDueDate(user.getId(), date).stream()
                .filter(task -> isOnOrAfterCreation(task, date))
                .collect(Collectors.toList());
        List<Task> recurrentTasks = taskRepository.findByUserIdAndRecurrent(user.getId(), true);
        List<Task> weeklyTasks = taskRepository.findByUserIdAndRecurrenceDaysIsNotNull(user.getId());

        if (date.equals(today)) {
            recurrentTasks = recurrentTasks.stream()
                    .filter(task -> isOnOrAfterCreation(task, today))
                    .collect(Collectors.toList());
            recurrentTasks.forEach(task -> resetIfCompletedOnAnotherDay(task, today));
            List<Task> matchingWeekly = weeklyTasks.stream()
                    .filter(task -> matchesRecurrenceDay(task, today))
                    .filter(task -> isOnOrAfterCreation(task, today))
                    .collect(Collectors.toList());
            matchingWeekly.forEach(task -> resetIfCompletedOnAnotherDay(task, today));
            weeklyTasks = matchingWeekly;
        } else {
            recurrentTasks = recurrentTasks.stream()
                    .filter(task -> isOnOrAfterCreation(task, date))
                    .map(task -> copyForDate(task, date))
                    .collect(Collectors.toList());
            weeklyTasks = weeklyTasks.stream()
                    .filter(task -> matchesRecurrenceDay(task, date))
                    .filter(task -> isOnOrAfterCreation(task, date))
                    .map(task -> copyForDate(task, date))
                    .collect(Collectors.toList());
        }

        List<Task> result = new ArrayList<>(dateTasks);
        result.addAll(recurrentTasks);
        result.addAll(weeklyTasks);

        result.sort((a, b) -> {
            if (a.getDueTime() == null && b.getDueTime() == null) return 0;
            if (a.getDueTime() == null) return 1;
            if (b.getDueTime() == null) return -1;
            return a.getDueTime().compareTo(b.getDueTime());
        });

        return result;
    }

    public List<Task> findAll(String email) {
        User user = userService.findByEmail(email);
        return taskRepository.findByUserId(user.getId());
    }

    public List<Task> findByMonth(String email, int year, int month) {
        User user = userService.findByEmail(email);
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return taskRepository.findByUserIdAndDueDateBetween(user.getId(), start, end);
    }

    public Task complete(Long id, String email) {
        User user = userService.findByEmail(email);
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada!"));
        task.setCompleted(true);
        task.setCompletedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public Task update(Long id, TaskRequest request, String email) {
        User user = userService.findByEmail(email);
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada!"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setRecurrent(request.isRecurrent());
        task.setDueTime(request.getDueTime());
        task.setAgendaEvent(request.isAgendaEvent());

        if (request.isAgendaEvent()) {
            task.setDueDate(request.getDueDate());
            task.setRecurrent(false);
            task.setRecurrenceDays(null);
        } else {
            task.setDueDate(null);
            if (request.isRecurrent()) {
                task.setRecurrenceDays(null);
            } else {
                task.setRecurrenceDays(normalizeRecurrenceDays(request.getRecurrenceDays()));
            }
        }

        return taskRepository.save(task);
    }

    public void delete(Long id, String email) {
        User user = userService.findByEmail(email);
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada!"));
        taskRepository.delete(task);
    }
}
