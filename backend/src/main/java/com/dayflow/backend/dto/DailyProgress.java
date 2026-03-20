package com.dayflow.backend.dto;

import java.time.LocalDate;

public class DailyProgress {
    private LocalDate date;
    private int total;
    private int completed;
    private int percentage;

    public DailyProgress() {}

    public DailyProgress(LocalDate date, int total, int completed, int percentage) {
        this.date = date;
        this.total = total;
        this.completed = completed;
        this.percentage = percentage;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public int getCompleted() { return completed; }
    public void setCompleted(int completed) { this.completed = completed; }

    public int getPercentage() { return percentage; }
    public void setPercentage(int percentage) { this.percentage = percentage; }
}
