package com.chatbot.travel.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chatbot.travel.model.*;
import com.chatbot.travel.model.enums.BookingStatus;
import com.chatbot.travel.model.enums.PaymentStatus;
import com.chatbot.travel.model.enums.TicketStatus;
import com.chatbot.travel.repository.*;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final RazorpayService razorpayService;
    private final TicketService ticketService;

    public PaymentService(PaymentRepository paymentRepository,
                          UserRepository userRepository,
                          BookingRepository bookingRepository,
                          TicketRepository ticketRepository,
                          RazorpayService razorpayService,
                          TicketService ticketService) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.razorpayService = razorpayService;
        this.ticketService = ticketService;
    }

    private Booking findBooking(Long bookingId, String bookingRef) {
        if (bookingRef != null && !bookingRef.trim().isEmpty()) {
            return bookingRepository.findByBookingRef(bookingRef.trim())
                    .orElseThrow(() -> new RuntimeException("Booking not found for ref: " + bookingRef));
        }
        if (bookingId != null) {
            return bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found for ID: " + bookingId));
        }
        throw new IllegalArgumentException("Either bookingId or bookingRef must be provided");
    }

    @Transactional
    public java.util.Map<String, Object> createRazorpayOrder(Long bookingId, Long userId, Integer amount) {
        return createRazorpayOrder(bookingId, null, userId, amount);
    }

    @Transactional
    public java.util.Map<String, Object> createRazorpayOrder(Long bookingId, String bookingRef, Long userId, Integer amount) {
        try {
            Booking booking = findBooking(bookingId, bookingRef);

            if (booking.getStatus() == BookingStatus.PAID || booking.getStatus() == BookingStatus.CONFIRMED) {
                throw new RuntimeException("Booking already paid");
            }

            // Capacity Check before creating order
            if (booking.getPlace() != null && booking.getVisitDate() != null) {
                int confirmedVisitors = bookingRepository.countConfirmedVisitors(booking.getPlace().getPlaceId(), booking.getVisitDate());
                int requestedVisitors = booking.getAdultCount() + booking.getChildCount();
                int capacity = booking.getPlace().getDailyCapacity();
                if (confirmedVisitors + requestedVisitors > capacity) {
                    throw new RuntimeException("Capacity exceeded for date " + booking.getVisitDate() +
                            ". Maximum available: " + Math.max(0, capacity - confirmedVisitors));
                }
            }

            // Check if user is provided
            User user = null;
            if (userId != null) {
                user = userRepository.findById(userId).orElse(null);
            }
            if (user == null && booking.getUser() != null) {
                user = booking.getUser();
            }

            // Amount handling: if amount is in rupees, calculate paise
            int amountInRupees = (amount != null && amount > 0) ? amount :
                    (booking.getTotalAmount() != null ? booking.getTotalAmount().intValue() : 0);
            if (amountInRupees <= 0) {
                throw new RuntimeException("Invalid booking amount");
            }

            String receipt = booking.getBookingRef() != null ? booking.getBookingRef() : "bkg_" + booking.getBookingId();

            // Check if existing pending payment exists with active orderId
            Optional<Payment> existingPaymentOpt = paymentRepository.findByBooking_BookingId(booking.getBookingId());
            if (existingPaymentOpt.isPresent()) {
                Payment existingPayment = existingPaymentOpt.get();
                if (existingPayment.getPaymentStatus() == PaymentStatus.PENDING && existingPayment.getRazorpayOrderId() != null) {
                    java.util.Map<String, Object> response = new java.util.HashMap<>();
                    response.put("key", razorpayService.getKeyId());
                    response.put("orderId", existingPayment.getRazorpayOrderId());
                    response.put("amount", amountInRupees * 100);
                    response.put("currency", "INR");
                    response.put("bookingId", booking.getBookingId());
                    response.put("bookingRef", booking.getBookingRef());
                    return response;
                }
            }

            org.json.JSONObject order = razorpayService.createOrderInPaise(amountInRupees * 100, receipt);

            Payment payment = existingPaymentOpt.orElseGet(Payment::new);
            payment.setUser(user);
            payment.setBooking(booking);
            payment.setAmount(java.math.BigDecimal.valueOf(amountInRupees));
            payment.setTransactionId("TXN_" + System.currentTimeMillis());
            payment.setPaymentStatus(PaymentStatus.PENDING);
            payment.setPaymentMethod("RAZORPAY");
            payment.setPaymentDate(LocalDateTime.now());
            payment.setRazorpayOrderId(order.getString("id"));

            paymentRepository.save(payment);

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("key", razorpayService.getKeyId());
            response.put("orderId", order.getString("id"));
            response.put("amount", order.getInt("amount"));
            response.put("currency", order.getString("currency"));
            response.put("bookingId", booking.getBookingId());
            response.put("bookingRef", booking.getBookingRef());

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    @Transactional
    public java.util.Map<String, Object> verifyRazorpayPayment(
            Long bookingId,
            Long userId,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature,
            String paymentMethod) {
        return verifyRazorpayPayment(bookingId, null, userId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethod);
    }

    @Transactional
    public java.util.Map<String, Object> verifyRazorpayPayment(
            Long bookingId,
            String bookingRef,
            Long userId,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature,
            String paymentMethod) {

        Booking booking = findBooking(bookingId, bookingRef);

        Payment payment = paymentRepository.findByBooking_BookingId(booking.getBookingId())
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setBooking(booking);
                    p.setAmount(booking.getTotalAmount());
                    p.setTransactionId("TXN_" + System.currentTimeMillis());
                    return p;
                });

        boolean valid = razorpayService.verifySignature(
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature
        );

        if (!valid) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setRazorpaySignature(razorpaySignature);
            paymentRepository.save(payment);

            booking.setStatus(BookingStatus.FAILED);
            bookingRepository.save(booking);

            throw new RuntimeException("Invalid Razorpay signature");
        }

        if (userId != null) {
            userRepository.findById(userId).ifPresent(payment::setUser);
        } else if (booking.getUser() != null) {
            payment.setUser(booking.getUser());
        }

        payment.setBooking(booking);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setPaymentMethod(paymentMethod != null ? paymentMethod : "RAZORPAY");
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        booking.setStatus(BookingStatus.PAID);
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // Generate Ticket idempotently
        Ticket ticket = ticketService.generateTicketForBooking(booking);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("message", "Payment verified successfully");
        response.put("bookingId", booking.getBookingId());
        response.put("bookingRef", booking.getBookingRef());
        response.put("ticketNumber", ticket.getTicketNumber());
        response.put("downloadUrl", "/api/tickets/" + booking.getBookingRef() + "/download");

        return response;
    }

    @Transactional
    public java.util.Map<String, Object> processWebhook(String payload, String signature) {
        boolean valid = razorpayService.verifyWebhookSignature(payload, signature);
        if (!valid) {
            throw new RuntimeException("Invalid Razorpay webhook signature");
        }

        try {
            org.json.JSONObject event = new org.json.JSONObject(payload);
            String eventType = event.optString("event");

            if ("payment.captured".equalsIgnoreCase(eventType)) {
                org.json.JSONObject paymentObj = event.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                String orderId = paymentObj.optString("order_id");
                String paymentId = paymentObj.optString("id");
                String method = paymentObj.optString("method");

                Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(orderId);

                if (paymentOpt.isPresent()) {
                    Payment payment = paymentOpt.get();
                    Booking booking = payment.getBooking();
                    if (booking != null && booking.getStatus() != BookingStatus.PAID) {
                        payment.setPaymentStatus(PaymentStatus.SUCCESS);
                        payment.setRazorpayPaymentId(paymentId);
                        payment.setPaymentMethod(method);
                        payment.setPaymentDate(LocalDateTime.now());
                        paymentRepository.save(payment);

                        booking.setStatus(BookingStatus.PAID);
                        booking.setBookingStatus(BookingStatus.CONFIRMED);
                        bookingRepository.save(booking);

                        ticketService.generateTicketForBooking(booking);
                    }
                }
            } else if ("payment.failed".equalsIgnoreCase(eventType)) {
                org.json.JSONObject paymentObj = event.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                String orderId = paymentObj.optString("order_id");
                String paymentId = paymentObj.optString("id");

                Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(orderId);

                if (paymentOpt.isPresent()) {
                    Payment payment = paymentOpt.get();
                    Booking booking = payment.getBooking();
                    if (booking != null && booking.getStatus() != BookingStatus.PAID) {
                        payment.setPaymentStatus(PaymentStatus.FAILED);
                        payment.setRazorpayPaymentId(paymentId);
                        paymentRepository.save(payment);

                        booking.setStatus(BookingStatus.FAILED);
                        bookingRepository.save(booking);
                    }
                }
            }

            return java.util.Map.of("status", "ok");
        } catch (Exception e) {
            throw new RuntimeException("Webhook processing error: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Payment createPayment(Payment payment) {

        User user = null;
        if (payment.getUser() != null && payment.getUser().getUserId() != null) {
            user = userRepository.findById(payment.getUser().getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        } else if (payment.getBooking() != null && payment.getBooking().getUser() != null) {
            user = payment.getBooking().getUser();
        }

        Booking booking = bookingRepository.findById(payment.getBooking().getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getBookingStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.PAID) {
            throw new RuntimeException("Booking already paid");
        }

        payment.setUser(user);
        payment.setBooking(booking);
        payment.setPaymentDate(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        if (savedPayment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            booking.setBookingStatus(BookingStatus.CONFIRMED);
            booking.setStatus(BookingStatus.PAID);
            bookingRepository.save(booking);

            ticketService.generateTicketForBooking(booking);
        }

        return savedPayment;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    @Transactional
    public Payment updatePayment(Long id, Payment payment) {

        Payment existing = getPaymentById(id);

        existing.setAmount(payment.getAmount());
        existing.setPaymentMethod(payment.getPaymentMethod());
        existing.setPaymentStatus(payment.getPaymentStatus());
        existing.setTransactionId(payment.getTransactionId());

        return existing;
    }

    @Transactional
    public void deletePayment(Long id) {
        Payment payment = getPaymentById(id);
        paymentRepository.delete(payment);
    }

    public List<Payment> getPaymentsByUser(Long userId) {
        return paymentRepository.findByUser_UserId(userId);
    }
}