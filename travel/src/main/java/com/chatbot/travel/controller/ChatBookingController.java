package com.chatbot.travel.controller;

import com.chatbot.travel.dto.BookingRequestDTO;
import com.chatbot.travel.dto.BookingSummaryDTO;
import com.chatbot.travel.dto.ExtractedIntent;
import com.chatbot.travel.model.Place;
import com.chatbot.travel.repository.BookingRepository;
import com.chatbot.travel.service.BookingSummaryService;
import com.chatbot.travel.service.ChatIntentService;
import com.chatbot.travel.service.PlaceResolverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatBookingController {

    private final ChatIntentService chatIntentService;
    private final PlaceResolverService placeResolverService;
    private final BookingSummaryService bookingSummaryService;
    private final BookingRepository bookingRepository;

    public ChatBookingController(ChatIntentService chatIntentService,
                                 PlaceResolverService placeResolverService,
                                 BookingSummaryService bookingSummaryService,
                                 BookingRepository bookingRepository) {
        this.chatIntentService = chatIntentService;
        this.placeResolverService = placeResolverService;
        this.bookingSummaryService = bookingSummaryService;
        this.bookingRepository = bookingRepository;
    }

    @PostMapping("/parse")
    public ResponseEntity<?> parseMessage(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        String sessionId = request.get("sessionId");

        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Session ID is required"));
        }

        ExtractedIntent intent = chatIntentService.extractIntent(message, sessionId);

        if ("low".equalsIgnoreCase(intent.getConfidence()) || !intent.getMissingFields().isEmpty()) {
            String missingField = intent.getMissingFields().get(0);
            String reply = getClarificationQuestion(missingField);
            return ResponseEntity.ok(Map.of(
                    "status", "clarification_needed",
                    "reply", reply,
                    "options", List.of()
            ));
        }

        List<Place> matches = placeResolverService.resolveByName(intent.getPlaceName());
        if (matches.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "status", "clarification_needed",
                    "reply", "I couldn't find any place matching '" + intent.getPlaceName() + "'. Could you please confirm the spelling or city name?",
                    "options", List.of()
            ));
        } else if (matches.size() > 1) {
            List<Map<String, Object>> options = new ArrayList<>();
            for (Place p : matches) {
                options.add(Map.of(
                        "id", p.getPlaceId(),
                        "name", p.getName(),
                        "city", p.getCity()
                ));
            }
            return ResponseEntity.ok(Map.of(
                    "status", "disambiguation",
                    "reply", "I found multiple matches for '" + intent.getPlaceName() + "'. Which one did you mean?",
                    "options", options
            ));
        }

        Place resolvedPlace = matches.get(0);

        LocalDate visitDate;
        try {
            visitDate = LocalDate.parse(intent.getDate());
        } catch (DateTimeParseException e) {
            return ResponseEntity.ok(Map.of(
                    "status", "clarification_needed",
                    "reply", "The visit date '" + intent.getDate() + "' seems invalid. Could you tell me a valid date (e.g. tomorrow or YYYY-MM-DD)?",
                    "options", List.of()
            ));
        }

        if (visitDate.isBefore(LocalDate.now())) {
            return ResponseEntity.ok(Map.of(
                    "status", "clarification_needed",
                    "reply", "You cannot book a visit for past dates. Please select today or a future date.",
                    "options", List.of()
            ));
        }

        String mappedTimeSlot = mapTimeSlot(intent.getTimeSlot());

        int requestedVisitors = intent.getAdultCount() + intent.getChildCount() + intent.getSeniorCount();
        int currentVisitors = bookingRepository.countConfirmedVisitors(resolvedPlace.getPlaceId(), visitDate);
        if (currentVisitors + requestedVisitors > resolvedPlace.getAvailableSlots()) {
            return ResponseEntity.ok(Map.of(
                    "status", "clarification_needed",
                    "reply", "Sorry, the slots are full for " + resolvedPlace.getName() + " on " + visitDate + ". Please choose another date or reduce the visitor count.",
                    "options", List.of()
            ));
        }

        BookingRequestDTO bookingRequest = new BookingRequestDTO(
                resolvedPlace.getPlaceId(),
                visitDate,
                mappedTimeSlot,
                intent.getAdultCount(),
                intent.getChildCount(),
                intent.getSeniorCount()
        );

        BookingSummaryDTO summary = bookingSummaryService.generateSummary(bookingRequest, resolvedPlace);

        return ResponseEntity.ok(Map.of(
                "status", "summary_ready",
                "summary", summary
        ));
    }

    private String getClarificationQuestion(String fieldName) {
        switch (fieldName) {
            case "placeName":
                return "Which monument or place would you like to visit?";
            case "date":
                return "When are you planning to visit? (e.g. tomorrow, next Friday, or YYYY-MM-DD)";
            case "timeSlot":
                return "Which time slot would you like — morning, afternoon, or evening?";
            case "adultCount":
                return "How many adults will be visiting?";
            default:
                return "Could you please provide more details for your booking?";
        }
    }

    private String mapTimeSlot(String chatTimeSlot) {
        if (chatTimeSlot == null) return "10AM-12PM";
        switch (chatTimeSlot.toLowerCase()) {
            case "morning":
                return "10AM-12PM";
            case "afternoon":
                return "12PM-2PM";
            case "evening":
                return "2PM-4PM";
            default:
                return "10AM-12PM";
        }
    }
}
