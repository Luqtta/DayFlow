package com.dayflow.backend.service;

import com.dayflow.backend.dto.TaskRequest;
import com.dayflow.backend.model.Routine;
import com.dayflow.backend.model.Task;
import com.dayflow.backend.model.TaskCompletion;
import com.dayflow.backend.model.User;
import com.dayflow.backend.repository.TaskCompletionRepository;
import com.dayflow.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
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
    private TaskCompletionRepository taskCompletionRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private RoutineService routineService;

    private static final ZoneId BRASILIA = ZoneId.of("America/Sao_Paulo");
    private static final ZoneId UTC = ZoneId.of("UTC");

    // Converte completedAt (UTC no banco) para data no fuso de Brasília
    private LocalDate completedAtToBrasiliaDate(LocalDateTime completedAt) {
        if (completedAt == null) return null;
        return completedAt.atZone(UTC)
                .withZoneSameInstant(BRASILIA)
                .toLocalDate();
    }

    private LocalDate createdAtToBrasiliaDate(LocalDateTime createdAt) {
        if (createdAt == null) return null;
        return createdAt.atZone(UTC)
                .withZoneSameInstant(BRASILIA)
                .toLocalDate();
    }

    private LocalDate todayBrasilia() {
        return LocalDate.now(BRASILIA);
    }

    private LocalDateTime nowUtc() {
        return LocalDateTime.now(ZoneOffset.UTC);
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

    private Task buildTaskView(Task task, boolean completed) {
        Task copy = new Task();
        copy.setId(task.getId());
        copy.setTitle(task.getTitle());
        copy.setDescription(task.getDescription());
        copy.setRecurrent(task.isRecurrent());
        copy.setRecurrenceDays(task.getRecurrenceDays());
        copy.setDueTime(task.getDueTime());
        copy.setAgendaEvent(task.isAgendaEvent());
        copy.setDueDate(task.getDueDate());
        copy.setCompleted(completed);
        return copy;
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

        // Fallback para tarefas de rotina sem dias definidos (evita "sumir")
        return !task.isAgendaEvent();
    }

    private Set<Long> completedTaskIdsForDate(List<Task> tasks, LocalDate date) {
        if (tasks.isEmpty()) return Collections.emptySet();

        List<Long> taskIds = tasks.stream().map(Task::getId).toList();
        Set<Long> completedIds = new HashSet<>();

        List<TaskCompletion> completions = taskCompletionRepository
                .findByTaskIdInAndCompletedDate(taskIds, date);
        for (TaskCompletion completion : completions) {
            completedIds.add(completion.getTask().getId());
        }

        // Fallback para completions antigas (antes da tabela task_completions)
        for (Task task : tasks) {
            LocalDate legacyDate = completedAtToBrasiliaDate(task.getCompletedAt());
            if (legacyDate != null && legacyDate.equals(date)) {
                completedIds.add(task.getId());
            }
        }

        return completedIds;
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
        String normalizedDays = normalizeRecurrenceDays(request.getRecurrenceDays());
        task.setRecurrenceDays(normalizedDays);

        if (request.isAgendaEvent()) {
            task.setDueDate(request.getDueDate());
            task.setRecurrent(false);
            task.setRecurrenceDays(null);
        } else {
            if (!request.isRecurrent() && normalizedDays == null) {
                throw new RuntimeException("Selecione ao menos um dia ou marque como recorrente!");
            }
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
        return findByDate(email, today, today);
    }

    public List<Task> findByDate(String email, LocalDate date, LocalDate today) {
        User user = userService.findByEmail(email);
        List<Task> scheduled = taskRepository.findByUserId(user.getId()).stream()
                .filter(task -> isScheduledOnDate(task, date))
                .collect(Collectors.toList());

        if (date.equals(today)) {
            scheduled.stream()
                    .filter(task -> !task.isAgendaEvent())
                    .forEach(task -> resetIfCompletedOnAnotherDay(task, today));
        }

        Set<Long> completedIds = completedTaskIdsForDate(scheduled, date);
        List<Task> result = scheduled.stream()
                .map(task -> buildTaskView(task, completedIds.contains(task.getId())))
                .collect(Collectors.toList());

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
        LocalDate completionDate = todayBrasilia();
        LocalDateTime completionAt = nowUtc();

        TaskCompletion completion = taskCompletionRepository
                .findByTaskIdAndCompletedDate(task.getId(), completionDate)
                .orElseGet(TaskCompletion::new);
        completion.setTask(task);
        completion.setCompletedDate(completionDate);
        completion.setCompletedAt(completionAt);
        taskCompletionRepository.save(completion);

        // Mantem compatibilidade com telas antigas (estado "concluido hoje")
        task.setCompleted(true);
        task.setCompletedAt(completionAt);
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
        String normalizedDays = normalizeRecurrenceDays(request.getRecurrenceDays());

        if (request.isAgendaEvent()) {
            task.setDueDate(request.getDueDate());
            task.setRecurrent(false);
            task.setRecurrenceDays(null);
        } else {
            if (!request.isRecurrent() && normalizedDays == null) {
                throw new RuntimeException("Selecione ao menos um dia ou marque como recorrente!");
            }
            task.setDueDate(null);
            if (request.isRecurrent()) {
                task.setRecurrenceDays(null);
            } else {
                task.setRecurrenceDays(normalizedDays);
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
