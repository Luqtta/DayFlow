package com.dayflow.backend.dto;

import java.util.List;

public class HistoryPage {
    private List<DailyProgress> items;
    private int page;
    private int size;
    private int total;
    private boolean hasMore;

    public HistoryPage() {}

    public HistoryPage(List<DailyProgress> items, int page, int size, int total, boolean hasMore) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.total = total;
        this.hasMore = hasMore;
    }

    public List<DailyProgress> getItems() { return items; }
    public void setItems(List<DailyProgress> items) { this.items = items; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public boolean isHasMore() { return hasMore; }
    public void setHasMore(boolean hasMore) { this.hasMore = hasMore; }
}
