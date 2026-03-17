package com.dayflow.backend.repository;

import com.dayflow.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserId(Long userId);
    List<Task> findByUserIdAndDueDate(Long userId, LocalDate dueDate);
    List<Task> findByRoutineId(Long routineId);
    List<Task> findByRoutineIdAndUserId(Long routineId, Long userId);
    List<Task> findByUserIdAndRecurrent(Long userId, boolean recurrent);
    List<Task> findByUserIdAndRecurrenceDaysIsNotNull(Long userId);
    Optional<Task> findByIdAndUserId(Long id, Long userId);
    List<Task> findByUserIdAndDueDateBetween(Long userId, LocalDate start, LocalDate end);
    List<Task> findByUserIdAndAgendaEvent(Long userId, boolean agendaEvent);
}
