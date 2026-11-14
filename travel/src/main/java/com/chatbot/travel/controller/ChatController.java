package com.chatbot.travel.controller;

import com.chatbot.travel.dto.ChatRequest;
import com.chatbot.travel.dto.ChatResponse;
import com.chatbot.travel.service.ChatSessionService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);
    private final ChatSessionService chatSessionService;

    public ChatController(ChatSessionService chatSessionService) {
        this.chatSessionService = chatSessionService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        try {
            ChatResponse response = chatSessionService.handleMessage(
                    request.getSessionId(),
                    request.getMessage(),
                    request.getUserId(),
                    request.getUserEmail()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing chat message: ", e);
            ChatSessionService.SessionContext ctx = chatSessionService.getOrCreateSession(request.getSessionId());
            ChatResponse fallback = new ChatResponse(
                    "⚠️ Something went wrong processing your request: " + e.getMessage() + "\nYou can try replying 'confirm' again or 'cancel' to start over.",
                    ctx.getState(),
                    ctx.getDraft(),
                    List.of("confirm", "cancel")
            );
            return ResponseEntity.ok(fallback);
        }
    }

    @PostMapping("/session/{sessionId}/status")
    public ResponseEntity<?> getSessionStatus(@PathVariable String sessionId) {
        ChatSessionService.SessionContext ctx = chatSessionService.getOrCreateSession(sessionId);
        return ResponseEntity.ok(Map.of(
                "sessionId", ctx.getSessionId(),
                "state", ctx.getState(),
                "bookingDraft", ctx.getDraft()
        ));
    }
}
