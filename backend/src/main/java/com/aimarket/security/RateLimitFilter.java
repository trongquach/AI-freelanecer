package com.aimarket.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String ip = request.getRemoteAddr();
        String path = request.getRequestURI();
        String userId = "anonymous";

        // If authenticated, get user ID (simplified for now, ideally from SecurityContext)
        if (request.getUserPrincipal() != null) {
            userId = request.getUserPrincipal().getName();
        }

        Bucket bucket;
        if (path.startsWith("/api/v1/ai/")) {
            // AI Endpoints: 10 calls/hour/user
            bucket = resolveBucket(userId + "-ai", 10, Duration.ofHours(1));
        } else if (!userId.equals("anonymous")) {
            // Authenticated: 1000 req/min
            bucket = resolveBucket(userId, 1000, Duration.ofMinutes(1));
        } else {
            // Public: 100 req/min/IP
            bucket = resolveBucket(ip, 100, Duration.ofMinutes(1));
        }

        if (bucket.tryConsume(1)) {
            response.setHeader("X-RateLimit-Remaining", String.valueOf(bucket.getAvailableTokens()));
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Too many requests");
        }
    }

    private Bucket resolveBucket(String key, int capacity, Duration refillDuration) {
        return cache.computeIfAbsent(key, k -> {
            Bandwidth limit = Bandwidth.classic(capacity, Refill.greedy(capacity, refillDuration));
            return Bucket.builder().addLimit(limit).build();
        });
    }
}
