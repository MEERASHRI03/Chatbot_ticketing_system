package com.chatbot.travel.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.chatbot.travel.dto.CreateOrderRequest;
import com.chatbot.travel.dto.VerifyPaymentRequest;
import com.chatbot.travel.model.Payment;
import com.chatbot.travel.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // ================= USER ACCESS =================

    // User creates payment
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public Payment createPayment(@RequestBody Payment payment) {
        return paymentService.createPayment(payment);
    }

    // User views their payments
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public List<Payment> getPaymentsByUser(@PathVariable Long userId) {
        return paymentService.getPaymentsByUser(userId);
    }

    // View payment by ID (can be allowed for both)
    @GetMapping("/{id}")
    public Payment getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id);
    }

    // ================= ADMIN ACCESS =================

    // Admin can see all payments
    @GetMapping
    @PreAuthorize("hasAnyRole('REGIONAL_ADMIN','SUPER_ADMIN')")
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    // Admin update payment status
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('REGIONAL_ADMIN','SUPER_ADMIN')")
    public Payment updatePayment(@PathVariable Long id,
            @RequestBody Payment payment) {
        return paymentService.updatePayment(id, payment);
    }

    // Only SUPER_ADMIN delete
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public String deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return "Payment deleted successfully";
    }

    // ================= RAZORPAY PAYMENT INTEGRATION =================

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Map<String, Object> order = paymentService.createRazorpayOrder(
                    request.getBookingId(),
                    request.getBookingRef(),
                    request.getUserId(),
                    request.getAmount());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody VerifyPaymentRequest request) {
        try {
            Map<String, Object> result = paymentService.verifyRazorpayPayment(
                    request.getBookingId(),
                    request.getBookingRef(),
                    request.getUserId(),
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature(),
                    request.getPaymentMethod());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature,
            @RequestBody String payload) {
        try {
            Map<String, Object> result = paymentService.processWebhook(payload, signature);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
