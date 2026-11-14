package com.chatbot.travel.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateContent(String systemInstruction, String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();

        Map<String, Object> contentMap = new HashMap<>();
        Map<String, Object> partsMap = new HashMap<>();
        partsMap.put("text", prompt);
        contentMap.put("parts", List.of(partsMap));
        requestBody.put("contents", List.of(contentMap));

        if (systemInstruction != null && !systemInstruction.isEmpty()) {
            Map<String, Object> systemInstructionMap = new HashMap<>();
            Map<String, Object> systemPartsMap = new HashMap<>();
            systemPartsMap.put("text", systemInstruction);
            systemInstructionMap.put("parts", List.of(systemPartsMap));
            requestBody.put("systemInstruction", systemInstructionMap);
        }

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return extractTextFromResponse(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage(), e);
        }
    }

    private String extractTextFromResponse(String rawJson) {
        try {
            JSONObject json = new JSONObject(rawJson);
            JSONArray candidates = json.getJSONArray("candidates");
            if (candidates.length() > 0) {
                JSONObject content = candidates.getJSONObject(0).getJSONObject("content");
                JSONArray parts = content.getJSONArray("parts");
                if (parts.length() > 0) {
                    return parts.getJSONObject(0).getString("text");
                }
            }
            throw new RuntimeException("No text content returned from Gemini API");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage(), e);
        }
    }
}
