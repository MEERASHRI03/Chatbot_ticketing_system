package com.chatbot.travel.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
}