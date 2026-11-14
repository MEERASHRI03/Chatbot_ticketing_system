package com.chatbot.travel.dto;

import jakarta.validation.constraints.NotBlank;

public class ChatRequest {
    @NotBlank(message = "sessionId is required")
    private String sessionId;

    @NotBlank(message = "message is required")
    private String message;

    private Long userId;
    private String userEmail;

    public ChatRequest() {}

    public ChatRequest(String sessionId, String message) {
        this.sessionId = sessionId;
        this.message = message;
    }

    public ChatRequest(String sessionId, String message, Long userId, String userEmail) {
        this.sessionId = sessionId;
        this.message = message;
        this.userId = userId;
        this.userEmail = userEmail;
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}
