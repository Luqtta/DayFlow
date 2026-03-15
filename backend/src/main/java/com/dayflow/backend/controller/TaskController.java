package com.dayflow.backend.controller;

import com.dayflow.backend.dto.TaskRequest;
import com.dayflow.backend.model.Task;
import com.dayflow.backend.model.User;
import com.dayflow.backend.repository.TaskRepository;
import com.dayflow.backend.service.TaskService;
import com.dayflow.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = {"https://day-flow-eta.vercel.app", "http://localhost:5173"})
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody TaskRequest request,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Task task = taskService.create(request, userDetails.getUsername());
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Task>> findAll(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.findAll(userDetails.getUsername()));
    }

    @GetMapping("/today")
    public ResponseEntity<List<Task>> findToday(@RequestParam(required = false) String today,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        LocalDate todayDate = today != null ? LocalDate.parse(today) : LocalDate.now();
        return ResponseEntity.ok(taskService.findToday(userDetails.getUsername(), todayDate));
    }

    @GetMapping("/date")
    public ResponseEntity<List<Task>> findByDate(@RequestParam String date,
                                                  @RequestParam(required = false) String today,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        LocalDate localDate = LocalDate.parse(date);
        LocalDate todayDate = today != null ? LocalDate.parse(today) : LocalDate.now();
        return ResponseEntity.ok(taskService.findByDate(userDetails.getUsername(), localDate, todayDate));
    }

    @GetMapping("/month")
    public ResponseEntity<List<Task>> findByMonth(@RequestParam int year,
                                                   @RequestParam int month,
                                                   @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.findByMonth(userDetails.getUsername(), year, month));
    }

    @GetMapping("/routine/{routineId}")
    public ResponseEntity<List<Task>> findByRoutine(@PathVariable Long routineId,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.findByEmail(userDetails.getUsername());
        return ResponseEntity.ok(taskRepository.findByRoutineIdAndUserId(routineId, user.getId()));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id,
                                      @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Task task = taskService.complete(id, userDetails.getUsername());
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                     @RequestBody TaskRequest request,
                                     @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Task task = taskService.update(id, request, userDetails.getUsername());
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        try {
            taskService.delete(id, userDetails.getUsername());
            return ResponseEntity.ok("Tarefa deletada com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}