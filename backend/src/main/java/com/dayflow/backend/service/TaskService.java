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
import java.util.ArrayList;
import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private RoutineService routineService;

    public Task create(TaskRequest request, String email) {
        User user = userService.findByEmail(email);
        Routine routine = routineService.findById(request.getRoutineId(), email);

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setRecurrent(request.isRecurrent());
        task.setRoutine(routine);
        task.setUser(user);

        if (!request.isRecurrent()) {
            task.setDueDate(request.getDueDate());
        }

        return taskRepository.save(task);
    }

    public List<Task> findToday(String email) {
        User user = userService.findByEmail(email);
        LocalDate today = LocalDate.now();

        List<Task> todayTasks = taskRepository.findByUserIdAndDueDate(user.getId(), today);
        List<Task> recurrentTasks = taskRepository.findByUserIdAndRecurrent(user.getId(), true);

        recurrentTasks.forEach(task -> {
            if (task.getCompletedAt() != null &&
                !task.getCompletedAt().toLocalDate().equals(today)) {
                task.setCompleted(false);
                task.setCompletedAt(null);
                taskRepository.save(task);
            }
        });

        List<Task> result = new ArrayList<>(todayTasks);
        result.addAll(recurrentTasks);
        return result;
    }

    public List<Task> findAll(String email) {
        User user = userService.findByEmail(email);
        return taskRepository.findByUserId(user.getId());
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

        if (!request.isRecurrent()) {
            task.setDueDate(request.getDueDate());
        } else {
            task.setDueDate(null);
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