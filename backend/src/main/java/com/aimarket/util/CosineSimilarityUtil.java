package com.aimarket.util;

import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Utility for computing cosine similarity between two embedding vectors.
 * Used by AIRecommendationService to rank expert profiles against job descriptions.
 */
@Component
public class CosineSimilarityUtil {

    /**
     * Computes cosine similarity between two float vectors.
     *
     * @param a first vector
     * @param b second vector
     * @return similarity in range [-1.0, 1.0]; returns 0.0 if either vector is null/empty/zero-norm
     */
    public double cosineSimilarity(List<Double> a, List<Double> b) {
        if (a == null || b == null || a.isEmpty() || b.isEmpty() || a.size() != b.size()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.size(); i++) {
            double ai = a.get(i);
            double bi = b.get(i);
            dotProduct += ai * bi;
            normA += ai * ai;
            normB += bi * bi;
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
