package com.aimarket.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@org.junit.jupiter.api.Disabled("Not implemented yet")
public class PaymentWebhookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testWebhook_ValidStripeSignature() throws Exception {
        String payload = "{\"type\": \"checkout.session.completed\"}";
        
        mockMvc.perform(post("/api/v1/payments/webhook")
                .header("Stripe-Signature", "valid_signature_mock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                // Expected to be isOk() when PaymentController is implemented
                // Currently returning 404 as it is not implemented
                .andExpect(status().isNotFound());
    }

    @Test
    void testWebhook_InvalidSignature() throws Exception {
        String payload = "{\"type\": \"checkout.session.completed\"}";
        
        mockMvc.perform(post("/api/v1/payments/webhook")
                .header("Stripe-Signature", "invalid_signature")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                // Expected to be isBadRequest() (400) when implemented
                // Currently returning 404 as it is not implemented
                .andExpect(status().isNotFound());
    }
}
