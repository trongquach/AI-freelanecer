package com.aimarket.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * A simple, Jackson-serializable wrapper for paginated results.
 * Replaces direct use of Spring's {@code PageImpl} in cached methods to avoid
 * deserialization errors.
 */
public class PageResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    // ─── No-arg constructor required by Jackson ────────────
    public PageResponse() {}

    // ─── Convenience factory ───────────────────────────────
    public static <T> PageResponse<T> of(Page<T> springPage) {
        PageResponse<T> r = new PageResponse<>();
        r.content       = springPage.getContent();
        r.page          = springPage.getNumber();
        r.size          = springPage.getSize();
        r.totalElements = springPage.getTotalElements();
        r.totalPages    = springPage.getTotalPages();
        r.first         = springPage.isFirst();
        r.last          = springPage.isLast();
        return r;
    }

    // ─── Getters & Setters ─────────────────────────────────
    public List<T> getContent()        { return content; }
    public void setContent(List<T> v)  { this.content = v; }

    public int getPage()               { return page; }
    public void setPage(int v)         { this.page = v; }

    public int getSize()               { return size; }
    public void setSize(int v)         { this.size = v; }

    public long getTotalElements()     { return totalElements; }
    public void setTotalElements(long v){ this.totalElements = v; }

    public int getTotalPages()         { return totalPages; }
    public void setTotalPages(int v)   { this.totalPages = v; }

    public boolean isFirst()           { return first; }
    public void setFirst(boolean v)    { this.first = v; }

    public boolean isLast()            { return last; }
    public void setLast(boolean v)     { this.last = v; }
}
