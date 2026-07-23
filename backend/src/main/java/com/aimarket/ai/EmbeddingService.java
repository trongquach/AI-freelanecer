package com.aimarket.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Shared embedding service — converts text → dense vector via DeepSeek Embeddings API.
 * Compatible with OpenAI embedding format (same request/response structure).
 *
 * <p>Endpoint: https://api.deepseek.com/embeddings
 * <p>Model: deepseek-embedding
 *
 * <p>Used by:
 * <ul>
 *   <li>{@link com.aimarket.service.AIRecommendationService} — expert profile matching</li>
 *   <li>{@link com.aimarket.service.AICVScreeningService} — vector-based CV scoring</li>
 * </ul>
 */
@Slf4j
@Service
public class EmbeddingService {

    @Value("${deepseek.api-key:}")
    private String apiKey;

    private static final String EMBEDDING_URL   = "https://api.deepseek.com/embeddings";
    private static final String EMBEDDING_MODEL = "deepseek-embedding";
    private static final int    MAX_CHARS       = 8000;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper  = new ObjectMapper();

    // ── Public API ────────────────────────────────────────────

    /**
     * Converts {@code text} into a dense embedding vector using DeepSeek Embeddings.
     *
     * @param text input text (truncated to 8 000 chars)
     * @return embedding vector, or {@code null} if API unavailable / key not configured
     */
    public List<Double> embed(String text) {
        if (text == null || text.isBlank()) return null;
        if (apiKey == null || apiKey.isBlank()) {
            log.debug("DeepSeek API key not configured — skipping embedding");
            return null;
        }
        String input = text.length() > MAX_CHARS ? text.substring(0, MAX_CHARS) : text;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of("model", EMBEDDING_MODEL, "input", input);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(EMBEDDING_URL, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> dataList =
                        (List<Map<String, Object>>) response.getBody().get("data");
                if (dataList != null && !dataList.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    List<Number> raw = (List<Number>) dataList.get(0).get("embedding");
                    return raw.stream().map(Number::doubleValue).collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            log.warn("DeepSeek Embedding API call failed: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Serialise a vector to JSON string for DB storage.
     */
    public String toJson(List<Double> vector) {
        if (vector == null) return null;
        try {
            return objectMapper.writeValueAsString(vector);
        } catch (Exception e) {
            log.warn("Failed to serialize embedding vector: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Deserialise a JSON string back to a vector.
     */
    public List<Double> fromJson(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<List<Double>>() {});
        } catch (Exception e) {
            log.warn("Failed to deserialize embedding JSON: {}", e.getMessage());
            return null;
        }
    }
}
