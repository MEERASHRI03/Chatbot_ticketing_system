package com.chatbot.travel.service;

import com.chatbot.travel.dto.ExtractedIntent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatIntentService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, SessionData> sessionStore = new ConcurrentHashMap<>();

    private static final long SESSION_TTL_MS = 600_000; // 10 minutes

    public ChatIntentService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    private static class SessionData {
        ExtractedIntent intent;
        long lastAccessTime;

        SessionData(ExtractedIntent intent) {
            this.intent = intent;
            this.lastAccessTime = System.currentTimeMillis();
        }

        void updateAccessTime() {
            this.lastAccessTime = System.currentTimeMillis();
        }
    }

    public ExtractedIntent getOrCreateIntent(String sessionId) {
        SessionData data = sessionStore.get(sessionId);
        if (data == null) {
            ExtractedIntent intent = new ExtractedIntent();
            intent.setMissingFields(List.of("placeName", "date", "timeSlot", "adultCount"));
            intent.setConfidence("low");
            intent.setAdultCount(0);
            intent.setChildCount(0);
            intent.setSeniorCount(0);
            data = new SessionData(intent);
            sessionStore.put(sessionId, data);
        } else {
            data.updateAccessTime();
        }
        return data.intent;
    }

    public void updateIntent(String sessionId, ExtractedIntent intent) {
        sessionStore.put(sessionId, new SessionData(intent));
    }

    public ExtractedIntent extractIntent(String message, String sessionId) {
        if (message != null && ("reset".equalsIgnoreCase(message.trim()) || "restart".equalsIgnoreCase(message.trim()))) {
            sessionStore.remove(sessionId);
            return getOrCreateIntent(sessionId);
        }

        ExtractedIntent previousIntent = getOrCreateIntent(sessionId);
        LocalDate currentDate = LocalDate.now();

        String systemPrompt = "You are an NLP ticketing chatbot assistant. Your task is to extract/update booking intent details from the user's message and merge them with any previous context.\n" +
                "Extract the following fields into JSON:\n" +
                "1. `placeName` (string, exactly as user said, do not classify type, preserve their spelling/names)\n" +
                "2. `date` (format YYYY-MM-DD. Resolve relative dates like 'tomorrow', 'day after tomorrow', 'today', 'next monday' using the current server date: " + currentDate.toString() + ")\n" +
                "3. `timeSlot` (must be one of: 'morning', 'afternoon', 'evening', or null)\n" +
                "4. `adultCount` (integer, null if not specified)\n" +
                "5. `childCount` (integer, null if not specified)\n" +
                "6. `seniorCount` (integer, null if not specified)\n" +
                "7. `confidence` ('high' or 'low'. High only if placeName, date, timeSlot, and adultCount are successfully resolved/known)\n" +
                "8. `missingFields` (array of strings, listing any missing fields among: 'placeName', 'date', 'timeSlot', 'adultCount')\n\n" +
                "CRITICAL INSTRUCTIONS:\n" +
                "- If the user specifies updates or corrections (e.g., 'make it 3 adults instead', 'actually Taj Mahal', 'change date to tomorrow'), overwrite/merge them into the previous context.\n" +
                "- If a field was previously resolved and the user's message doesn't change it, keep the previous value.\n" +
                "- Output ONLY valid raw JSON. Do not wrap the JSON in markdown code blocks like ```json ... ```. No preamble or conversational filler.";

        String userPrompt = "";
        try {
            String previousIntentJson = objectMapper.writeValueAsString(previousIntent);
            userPrompt = "Previous Intent Context: " + previousIntentJson + "\n" +
                    "User Message: \"" + message + "\"\n" +
                    "Please return the updated/merged intent JSON:";
        } catch (Exception e) {
            userPrompt = "User Message: \"" + message + "\"\n" +
                    "Please return the intent JSON:";
        }

        String rawResponse = geminiService.generateContent(systemPrompt, userPrompt);
        String cleanedResponse = stripMarkdownFences(rawResponse);

        try {
            ExtractedIntent updatedIntent = objectMapper.readValue(cleanedResponse, ExtractedIntent.class);
            
            if (updatedIntent.getAdultCount() == null) {
                updatedIntent.setAdultCount(previousIntent.getAdultCount() != null ? previousIntent.getAdultCount() : 0);
            }
            if (updatedIntent.getChildCount() == null) {
                updatedIntent.setChildCount(previousIntent.getChildCount() != null ? previousIntent.getChildCount() : 0);
            }
            if (updatedIntent.getSeniorCount() == null) {
                updatedIntent.setSeniorCount(previousIntent.getSeniorCount() != null ? previousIntent.getSeniorCount() : 0);
            }

            List<String> missing = new ArrayList<>();
            if (updatedIntent.getPlaceName() == null || updatedIntent.getPlaceName().trim().isEmpty()) {
                missing.add("placeName");
            }
            if (updatedIntent.getDate() == null || updatedIntent.getDate().trim().isEmpty()) {
                missing.add("date");
            }
            if (updatedIntent.getTimeSlot() == null || updatedIntent.getTimeSlot().trim().isEmpty()) {
                missing.add("timeSlot");
            }
            if (updatedIntent.getAdultCount() == null || updatedIntent.getAdultCount() <= 0) {
                missing.add("adultCount");
            }
            updatedIntent.setMissingFields(missing);
            
            if (missing.isEmpty()) {
                updatedIntent.setConfidence("high");
            } else {
                updatedIntent.setConfidence("low");
            }

            updateIntent(sessionId, updatedIntent);
            return updatedIntent;
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini intent extraction: " + e.getMessage() + "\nRaw response was: " + rawResponse);
            return previousIntent;
        }
    }

    private String stripMarkdownFences(String response) {
        if (response == null) return "{}";
        response = response.trim();
        // Remove markdown fences dynamically using regex
        response = response.replaceAll("^```[a-zA-Z]*\\s*", "");
        response = response.replaceAll("\\s*```$", "");
        return response.trim();
    }

    @Scheduled(fixedRate = 60000)
    public void evictExpiredSessions() {
        long now = System.currentTimeMillis();
        sessionStore.entrySet().removeIf(entry -> (now - entry.getValue().lastAccessTime) > SESSION_TTL_MS);
    }
}
