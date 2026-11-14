package com.chatbot.travel.service;

import com.chatbot.travel.dto.BookingDraft;
import com.chatbot.travel.dto.ChatResponse;
import com.chatbot.travel.model.Booking;
import com.chatbot.travel.model.Place;
import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.model.User;
import com.chatbot.travel.model.enums.BookingStatus;
import com.chatbot.travel.model.enums.ChatState;
import com.chatbot.travel.repository.BookingRepository;
import com.chatbot.travel.repository.PlaceRepository;
import com.chatbot.travel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatSessionService {

    private static final Logger log = LoggerFactory.getLogger(ChatSessionService.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final BookingIntentParser intentParser;
    private final PlaceRepository placeRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PaymentService paymentService;
    private final TicketService ticketService;

    private final Map<String, SessionContext> sessions = new ConcurrentHashMap<>();

    public ChatSessionService(BookingIntentParser intentParser,
                              PlaceRepository placeRepository,
                              BookingRepository bookingRepository,
                              UserRepository userRepository,
                              PaymentService paymentService,
                              TicketService ticketService) {
        this.intentParser = intentParser;
        this.placeRepository = placeRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.paymentService = paymentService;
        this.ticketService = ticketService;
    }

    public static class SessionContext {
        private final String sessionId;
        private Long userId;
        private String userEmail;
        private ChatState state = ChatState.IDLE;
        private BookingDraft draft = new BookingDraft();
        private long lastAccessed = System.currentTimeMillis();

        public SessionContext(String sessionId) {
            this.sessionId = sessionId;
        }

        public String getSessionId() { return sessionId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
        public ChatState getState() { return state; }
        public void setState(ChatState state) { this.state = state; }
        public BookingDraft getDraft() { return draft; }
        public void setDraft(BookingDraft draft) { this.draft = draft; }
        public void touch() { this.lastAccessed = System.currentTimeMillis(); }
    }

    public SessionContext getOrCreateSession(String sessionId) {
        return sessions.computeIfAbsent(sessionId, SessionContext::new);
    }

    public void updateSessionState(String sessionId, ChatState state) {
        SessionContext ctx = getOrCreateSession(sessionId);
        ctx.setState(state);
    }

    public void markSessionCompleted(String sessionId, String bookingRef, String ticketNumber) {
        SessionContext ctx = getOrCreateSession(sessionId);
        ctx.setState(ChatState.COMPLETED);
        if (ctx.getDraft() != null) {
            ctx.getDraft().setBookingRef(bookingRef);
            ctx.getDraft().setTicketNumber(ticketNumber);
            ctx.getDraft().setDownloadUrl("/api/tickets/" + bookingRef + "/download");
        }
    }

    @Transactional
    public ChatResponse handleMessage(String sessionId, String message) {
        return handleMessage(sessionId, message, null, null);
    }

    @Transactional
    public ChatResponse handleMessage(String sessionId, String message, Long userId, String userEmail) {
        SessionContext ctx = getOrCreateSession(sessionId);
        ctx.touch();
        if (userId != null) {
            ctx.setUserId(userId);
        }
        if (userEmail != null && !userEmail.trim().isEmpty()) {
            ctx.setUserEmail(userEmail.trim());
        }

        if (message == null || message.trim().isEmpty()) {
            return new ChatResponse("Please type a message to chat with me.", ctx.getState(), ctx.getDraft(), List.of());
        }

        String raw = message.trim();
        String lower = raw.toLowerCase();

        // Universal reset command
        if (isResetCommand(lower)) {
            ctx.setState(ChatState.IDLE);
            ctx.setDraft(new BookingDraft());
            return new ChatResponse(
                    "Session reset. What monument or place would you like to visit and for when? (e.g., 'book ticket to visit red fort for tomorrow of 5 members with 3 adults and 2 child')",
                    ChatState.IDLE, ctx.getDraft(), List.of()
            );
        }

        List<Place> activePlaces = placeRepository.findAll();

        switch (ctx.getState()) {
            case IDLE:
                return handleIdle(ctx, raw, lower, activePlaces);

            case COLLECTING:
                return handleCollecting(ctx, raw, lower, activePlaces);

            case CONFIRMING:
                return handleConfirming(ctx, raw, lower, activePlaces);

            case AWAITING_PAYMENT:
                return handleAwaitingPayment(ctx, raw, lower);

            case COMPLETED:
                return handleCompleted(ctx, raw, lower, activePlaces);

            default:
                ctx.setState(ChatState.IDLE);
                return new ChatResponse("How can I help you book tickets today?", ChatState.IDLE, ctx.getDraft(), List.of());
        }
    }

    private ChatResponse handleIdle(SessionContext ctx, String raw, String lower, List<Place> places) {
        if (isGreeting(lower)) {
            return new ChatResponse(
                    "Hi there! 👋 I'm your ticketing assistant. Where would you like to visit and for what date? You can say: 'book ticket to visit red fort for tomorrow of 5 members with 3 adults and 2 child'.",
                    ChatState.IDLE, ctx.getDraft(), List.of()
            );
        }

        BookingDraft draft = new BookingDraft();
        ctx.setDraft(draft);

        return processSlotExtraction(ctx, raw, places);
    }

    private ChatResponse handleCollecting(SessionContext ctx, String raw, String lower, List<Place> places) {
        if (isCancelCommand(lower)) {
            ctx.setState(ChatState.IDLE);
            ctx.setDraft(new BookingDraft());
            return new ChatResponse("Booking cancelled. Where would you like to visit next?", ChatState.IDLE, ctx.getDraft(), List.of());
        }

        return processSlotExtraction(ctx, raw, places);
    }

    private ChatResponse processSlotExtraction(SessionContext ctx, String raw, List<Place> places) {
        BookingDraft draft = ctx.getDraft();

        BookingIntentParser.ParseResult parsed = intentParser.parse(raw, places, draft);

        if (parsed.getValidationError() != null) {
            ctx.setState(ChatState.COLLECTING);
            draft.setValidationError(parsed.getValidationError());
            return new ChatResponse(
                    "⚠️ " + parsed.getValidationError() + "\nPlease provide the correct details to continue.",
                    ChatState.COLLECTING, draft, List.of()
            );
        }

        // Apply extracted slots
        if (parsed.getPlace() != null) {
            draft.setPlaceId(parsed.getPlace().getPlaceId());
            draft.setPlaceName(parsed.getPlace().getName());
            draft.setAdultPrice(parsed.getPlace().getAdultPrice());
            draft.setChildPrice(parsed.getPlace().getChildPrice());
        }
        if (parsed.getVisitDate() != null) {
            draft.setVisitDate(parsed.getVisitDate());
        }
        if (parsed.getAdults() != null) {
            draft.setAdults(parsed.getAdults());
        }
        if (parsed.getChildren() != null) {
            draft.setChildren(parsed.getChildren());
        }
        if (parsed.getTotalMembers() != null) {
            draft.setTotalMembers(parsed.getTotalMembers());
        }

        draft.calculateTotal();
        draft.setValidationError(null);

        // Check missing slots
        List<String> missing = new ArrayList<>();
        if (draft.getPlaceName() == null) missing.add("place");
        if (draft.getVisitDate() == null) missing.add("visitDate");
        if (draft.getAdults() == null) missing.add("adults");
        draft.setMissingFields(missing);

        if (!missing.isEmpty()) {
            ctx.setState(ChatState.COLLECTING);
            String prompt = getPromptForMissingSlot(missing.get(0), draft);
            return new ChatResponse(prompt, ChatState.COLLECTING, draft, List.of());
        }

        // All slots present and valid -> transition to CONFIRMING
        ctx.setState(ChatState.CONFIRMING);
        String summary = buildConfirmationSummary(draft);
        return new ChatResponse(summary, ChatState.CONFIRMING, draft, List.of("confirm", "cancel"));
    }

    private ChatResponse handleConfirming(SessionContext ctx, String raw, String lower, List<Place> places) {
        BookingDraft draft = ctx.getDraft();

        if (isCancelCommand(lower)) {
            ctx.setState(ChatState.IDLE);
            ctx.setDraft(new BookingDraft());
            return new ChatResponse("Booking cancelled. What monument or place would you like to visit next?", ChatState.IDLE, ctx.getDraft(), List.of());
        }

        if (isConfirmCommand(lower)) {
            // Check Capacity before creating booking & order
            Place place = null;
            if (draft.getPlaceId() != null) {
                place = placeRepository.findById(draft.getPlaceId()).orElse(null);
            }
            if (place == null && draft.getPlaceName() != null) {
                place = placeRepository.findByNameContainingIgnoreCase(draft.getPlaceName()).stream().findFirst().orElse(null);
            }
            if (place == null) {
                ctx.setState(ChatState.COLLECTING);
                return new ChatResponse("Could not locate the selected monument. Which monument would you like to visit?", ChatState.COLLECTING, draft, List.of());
            }

            if (draft.getVisitDate() != null) {
                int confirmedVisitors = 0;
                try {
                    confirmedVisitors = bookingRepository.countConfirmedVisitors(place.getPlaceId(), draft.getVisitDate());
                } catch (Exception e) {
                    log.warn("Could not check confirmed visitors count: {}", e.getMessage());
                }
                int requested = (draft.getAdults() != null ? draft.getAdults() : 0) + (draft.getChildren() != null ? draft.getChildren() : 0);
                int dailyCap = place.getDailyCapacity();
                if (dailyCap > 0 && confirmedVisitors + requested > dailyCap) {
                    ctx.setState(ChatState.COLLECTING);
                    draft.setVisitDate(null);
                    return new ChatResponse(
                            "❌ Sorry, slots are full for " + place.getName() + " on " + draft.getVisitDate() +
                                    " (Capacity: " + dailyCap + ", Already booked: " + confirmedVisitors + "). Please choose another date.",
                            ChatState.COLLECTING, draft, List.of()
                    );
                }
            }

            // Create Booking in DB as PENDING
            Booking booking = new Booking();
            booking.setPlace(place);
            booking.setVisitDate(draft.getVisitDate());
            booking.setAdultCount(draft.getAdults() != null ? draft.getAdults() : 1);
            booking.setChildCount(draft.getChildren() != null ? draft.getChildren() : 0);
            booking.setTotalAmount(draft.getTotalAmount() != null ? draft.getTotalAmount() : java.math.BigDecimal.ZERO);
            booking.setStatus(BookingStatus.PENDING);
            booking.setBookingStatus(BookingStatus.PENDING);
            booking.setSessionId(ctx.getSessionId());

            // Associate with authenticated/session user, or fallback to guest user
            User bookingUser = null;
            if (ctx.getUserId() != null) {
                bookingUser = userRepository.findById(ctx.getUserId()).orElse(null);
            }
            if (bookingUser == null && ctx.getUserEmail() != null && !ctx.getUserEmail().trim().isEmpty()) {
                bookingUser = userRepository.findByEmail(ctx.getUserEmail().trim()).orElse(null);
            }
            if (bookingUser == null) {
                bookingUser = userRepository.findByEmail("guest@chatbot.travel")
                        .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));
            }
            if (bookingUser != null) {
                booking.setUser(bookingUser);
            }

            booking = bookingRepository.save(booking);

            draft.setBookingId(booking.getBookingId());
            draft.setBookingRef(booking.getBookingRef());

            // Create Razorpay Order
            try {
                int amountRupees = draft.getTotalAmount() != null ? draft.getTotalAmount().intValue() : 0;
                Map<String, Object> orderMap = paymentService.createRazorpayOrder(
                        booking.getBookingId(),
                        booking.getBookingRef(),
                        bookingUser != null ? bookingUser.getUserId() : null,
                        amountRupees
                );
                draft.setRazorpayOrderId((String) orderMap.get("orderId"));
                draft.setRazorpayKeyId((String) orderMap.get("key"));
                draft.setAmountInPaise((Integer) orderMap.get("amount"));
            } catch (Exception e) {
                log.error("Failed to create Razorpay order for bookingRef {}: {}", booking.getBookingRef(), e.getMessage());
            }

            ctx.setState(ChatState.AWAITING_PAYMENT);

            String reply = "Booking created with reference **" + booking.getBookingRef() + "**!\n" +
                    "Total amount to pay: **INR " + (draft.getTotalAmount() != null ? draft.getTotalAmount() : "0") + "**.\n" +
                    "Please click the **Pay now** button below to complete payment via Razorpay.";

            return new ChatResponse(reply, ChatState.AWAITING_PAYMENT, draft, List.of("pay_now", "cancel"));
        }

        // Check if user is modifying details (e.g., "change date to 20 nov", "make it 4 adults")
        BookingIntentParser.ParseResult recheck = intentParser.parse(raw, places, draft);
        if (recheck.getValidationError() == null && (recheck.getPlace() != null || recheck.getVisitDate() != null || recheck.getAdults() != null)) {
            return processSlotExtraction(ctx, raw, places);
        }

        return new ChatResponse(
                "Please reply **'yes'** or **'confirm'** to proceed to payment, or **'cancel'** to discard.",
                ChatState.CONFIRMING, draft, List.of("confirm", "cancel")
        );
    }

    private ChatResponse handleAwaitingPayment(SessionContext ctx, String raw, String lower) {
        BookingDraft draft = ctx.getDraft();

        if (isCancelCommand(lower)) {
            if (draft.getBookingId() != null) {
                bookingRepository.findById(draft.getBookingId()).ifPresent(b -> {
                    b.setStatus(BookingStatus.CANCELLED);
                    b.setBookingStatus(BookingStatus.CANCELLED);
                    bookingRepository.save(b);
                });
            }
            ctx.setState(ChatState.IDLE);
            ctx.setDraft(new BookingDraft());
            return new ChatResponse("Your pending booking has been cancelled.", ChatState.IDLE, ctx.getDraft(), List.of());
        }

        // Check if booking was already paid in DB via verify endpoint or webhook
        if (draft.getBookingRef() != null) {
            Optional<Booking> opt = bookingRepository.findByBookingRef(draft.getBookingRef());
            if (opt.isPresent() && (opt.get().getStatus() == BookingStatus.PAID || opt.get().getStatus() == BookingStatus.CONFIRMED)) {
                ctx.setState(ChatState.COMPLETED);
                Ticket ticket = ticketService.getTicketByBookingRef(draft.getBookingRef());
                draft.setTicketNumber(ticket.getTicketNumber());
                draft.setDownloadUrl("/api/tickets/" + draft.getBookingRef() + "/download");
                return new ChatResponse(
                        "🎉 Payment confirmed! Your e-ticket number is **" + ticket.getTicketNumber() + "**.\n" +
                                "You can click **Download Ticket** below to save your PDF pass.",
                        ChatState.COMPLETED, draft, List.of("download_ticket")
                );
            }
        }

        return new ChatResponse(
                "Your booking **" + (draft.getBookingRef() != null ? draft.getBookingRef() : "") + "** is awaiting payment of INR " +
                        (draft.getTotalAmount() != null ? draft.getTotalAmount() : "") + ".\n" +
                        "Click **Pay now** to complete checkout, or reply 'cancel' to abort.",
                ChatState.AWAITING_PAYMENT, draft, List.of("pay_now", "cancel")
        );
    }

    private ChatResponse handleCompleted(SessionContext ctx, String raw, String lower, List<Place> places) {
        BookingDraft draft = ctx.getDraft();
        if (lower.contains("book") || lower.contains("visit") || lower.contains("ticket")) {
            ctx.setState(ChatState.IDLE);
            ctx.setDraft(new BookingDraft());
            return handleIdle(ctx, raw, lower, places);
        }

        return new ChatResponse(
                "Your booking is complete! You can download your ticket below or type a new booking request.",
                ChatState.COMPLETED, draft, List.of("download_ticket")
        );
    }

    private String getPromptForMissingSlot(String slot, BookingDraft draft) {
        switch (slot) {
            case "place":
                return "Which monument or place would you like to visit?";
            case "visitDate":
                String place = draft.getPlaceName() != null ? draft.getPlaceName() : "the monument";
                return "What date would you like to visit " + place + "? (e.g., today, tomorrow, or a specific date like 15/11/2026)";
            case "adults":
                return "How many adults will be visiting? (At least 1 adult is required per booking)";
            default:
                return "Could you please specify your visit details?";
        }
    }

    private String buildConfirmationSummary(BookingDraft draft) {
        String dateStr = draft.getVisitDate() != null ? draft.getVisitDate().format(DATE_FMT) : "N/A";
        int adults = draft.getAdults() != null ? draft.getAdults() : 0;
        int children = draft.getChildren() != null ? draft.getChildren() : 0;
        double adPrice = draft.getAdultPrice() != null ? draft.getAdultPrice() : 0.0;
        double chPrice = draft.getChildPrice() != null ? draft.getChildPrice() : 0.0;
        String total = draft.getTotalAmount() != null ? "₹" + draft.getTotalAmount() : "₹0";

        StringBuilder sb = new StringBuilder();
        sb.append("Please confirm your booking details:\n");
        sb.append("🏛️ Monument: **").append(draft.getPlaceName()).append("**\n");
        sb.append("📅 Date: **").append(dateStr).append("**\n");
        sb.append("👥 Adults: **").append(adults).append(" x ₹").append(String.format("%.0f", adPrice))
                .append(" = ₹").append(String.format("%.0f", adults * adPrice)).append("**\n");
        if (children > 0) {
            sb.append("👶 Children: **").append(children).append(" x ₹").append(String.format("%.0f", chPrice))
                    .append(" = ₹").append(String.format("%.0f", children * chPrice)).append("**\n");
        }
        sb.append("💰 Total Amount: **").append(total).append("**\n\n");
        sb.append("Would you like to confirm this booking? Please reply **'yes'** or **'confirm'** to proceed, or **'cancel'** to start over.");
        return sb.toString();
    }

    private boolean isGreeting(String lower) {
        return lower.matches("^(hi|hello|hey|namaste|greetings)(\\s+.*)?$");
    }

    private boolean isResetCommand(String lower) {
        return lower.equals("reset") || lower.equals("restart") || lower.equals("start over") || lower.equals("clear");
    }

    private boolean isConfirmCommand(String lower) {
        return lower.matches("^(yes|y|confirm|confirmed|proceed|sure|ok|okay|yep|yeah|pay)$");
    }

    private boolean isCancelCommand(String lower) {
        return lower.matches("^(no|cancel|cancelled|stop|abort|quit)$");
    }
}
