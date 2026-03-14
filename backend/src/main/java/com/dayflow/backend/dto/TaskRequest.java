package com.dayflow.backend.dto;

import java.time.LocalDate;

public class TaskRequest {
    private String title;
    private String description;
    private LocalDate dueDate;
    private Long routineId;
    private boolean recurrent = false;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public Long getRoutineId() { return routineId; }
    public void setRoutineId(Long routineId) { this.routineId = routineId; }

    public boolean isRecurrent() { return recurrent; }
    public void setRecurrent(boolean recurrent) { this.recurrent = recurrent; }
}