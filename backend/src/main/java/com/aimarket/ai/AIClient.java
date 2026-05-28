package com.aimarket.ai;

/**
 * Abstraction for LLM API calls (Anthropic / OpenAI).
 */
public interface AIClient {
    String complete(String systemPrompt, String userMessage, int maxTokens);
}
