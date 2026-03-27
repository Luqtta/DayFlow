package com.dayflow.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class TaskRequest {
    private String title;
    private String description;
    private LocalDate dueDate;
    private LocalTime dueTime;
    private LocalTime endTime;
    private Long routineId;
    private boolean recurrent = false;
    private boolean agendaEvent = false;
    private List<Integer> recurrenceDays;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalTime getDueTime() { return dueTime; }
    public void setDueTime(LocalTime dueTime) { this.dueTime = dueTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Long getRoutineId() { return routineId; }
    public void setRoutineId(Long routineId) { this.routineId = routineId; }

    public boolean isRecurrent() { return recurrent; }
    public void setRecurrent(boolean recurrent) { this.recurrent = recurrent; }

    public boolean isAgendaEvent() { return agendaEvent; }
    public void setAgendaEvent(boolean agendaEvent) { this.agendaEvent = agendaEvent; }

    public List<Integer> getRecurrenceDays() { return recurrenceDays; }
    public void setRecurrenceDays(List<Integer> recurrenceDays) { this.recurrenceDays = recurrenceDays; }
}
