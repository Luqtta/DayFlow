package com.dayflow.backend.repository;

import com.dayflow.backend.model.TaskCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskCompletionRepository extends JpaRepository<TaskCompletion, Long> {
    Optional<TaskCompletion> findByTaskIdAndCompletedDate(Long taskId, LocalDate completedDate);
    List<TaskCompletion> findByTaskIdInAndCompletedDate(List<Long> taskIds, LocalDate completedDate);
    List<TaskCompletion> findByTaskUserIdAndCompletedDateBetween(Long userId, LocalDate start, LocalDate end);
}
