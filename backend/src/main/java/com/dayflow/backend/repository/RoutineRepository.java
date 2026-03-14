package com.dayflow.backend.repository;

import com.dayflow.backend.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {
    List<Routine> findByUserId(Long userId);
    Optional<Routine> findByIdAndUserId(Long id, Long userId);
}