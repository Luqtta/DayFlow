package com.dayflow.backend.repository;

import com.dayflow.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    // Batch load para o ranking (elimina o N+1 por usuario)
    List<Task> findByUserIdIn(List<Long> userIds);

    /**
     * Filtra no banco as tarefas agendadas em uma data especifica, replicando a regra
     * de isScheduledOnDate (dueDate fixa, recorrente diaria, dias-da-semana ou fallback
     * de rotina) em vez de carregar todas as tarefas e filtrar em memoria.
     *
     * @param dayOfWeek      dia ISO da data (1=segunda ... 7=domingo) como string
     * @param creationCutoff instante UTC = inicio do dia seguinte (fuso Brasilia);
     *                       garante que a tarefa so aparece a partir da sua criacao
     */
    @Query("""
            SELECT t FROM Task t
            WHERE t.user.id = :userId
              AND (t.createdAt IS NULL OR t.createdAt < :creationCutoff)
              AND (
                    (t.dueDate IS NOT NULL AND t.dueDate = :date)
                    OR (t.dueDate IS NULL AND (
                          t.recurrent = true
                          OR (t.recurrenceDays IS NOT NULL AND t.recurrenceDays <> ''
                              AND CONCAT(',', t.recurrenceDays, ',') LIKE CONCAT('%,', :dayOfWeek, ',%'))
                          OR ((t.recurrenceDays IS NULL OR t.recurrenceDays = '') AND t.agendaEvent = false)
                    ))
              )
            """)
    List<Task> findScheduledOnDate(@Param("userId") Long userId,
                                   @Param("date") LocalDate date,
                                   @Param("dayOfWeek") String dayOfWeek,
                                   @Param("creationCutoff") LocalDateTime creationCutoff);
}
