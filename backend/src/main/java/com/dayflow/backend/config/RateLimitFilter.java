package com.dayflow.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> windowStart = new ConcurrentHashMap<>();

    private static final int MAX_REQUESTS = 30;
    private static final int WINDOW_SECONDS = 60;

    private static final java.util.List<String> LIMITED_PATHS = java.util.List.of(
        "/auth/register",
        "/auth/forgot-password",
        "/auth/resend-code",
        "/auth/verify-email",
        "/auth/reset-password"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        boolean isLimited = LIMITED_PATHS.stream().anyMatch(path::startsWith);

        if (!isLimited) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = getClientIp(request);
        String key = ip + ":" + path;

        LocalDateTime now = LocalDateTime.now();
        windowStart.putIfAbsent(key, now);

        if (java.time.Duration.between(windowStart.get(key), now).getSeconds() > WINDOW_SECONDS) {
            windowStart.put(key, now);
            requestCounts.put(key, new AtomicInteger(0));
        }

        AtomicInteger count = requestCounts.computeIfAbsent(key, k -> new AtomicInteger(0));

        if (count.incrementAndGet() > MAX_REQUESTS) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Muitas requisições. Tente novamente em alguns minutos!\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}