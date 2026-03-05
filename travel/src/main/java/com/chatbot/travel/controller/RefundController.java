package com.chatbot.travel.controller;

import com.chatbot.travel.model.Refund;
import com.chatbot.travel.service.RefundService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {

    private final RefundService refundService;

    public RefundController(RefundService refundService) {
        this.refundService = refundService;
    }

    // ================= USER ACCESS =================

    // User can request refund
    @PostMapping("/request/{ticketId}")
    @PreAuthorize("hasRole('USER')")
    public Refund requestRefund(@PathVariable Long ticketId,
                                @RequestParam String reason) {
        return refundService.requestRefundByTicketId(ticketId, reason);
    }

    // User can view own refund (optional - if needed later)
    @GetMapping("/{refundId}")
    public Refund getRefundById(@PathVariable Long refundId) {
        return refundService.getRefundById(refundId);
    }

    // ================= ADMIN ACCESS =================

    // Admins can approve
    @PutMapping("/approve/{refundId}")
    @PreAuthorize("hasAnyRole('REGIONAL_ADMIN','SUPER_ADMIN')")
    public Refund approveRefund(@PathVariable Long refundId) {
        return refundService.approveRefund(refundId);
    }

    // Admins can reject
    @PutMapping("/reject/{refundId}")
    @PreAuthorize("hasAnyRole('REGIONAL_ADMIN','SUPER_ADMIN')")
    public Refund rejectRefund(@PathVariable Long refundId) {
        return refundService.rejectRefund(refundId);
    }

    // Admins can view all refunds
    @GetMapping
    @PreAuthorize("hasAnyRole('REGIONAL_ADMIN','SUPER_ADMIN')")
    public List<Refund> getAllRefunds() {
        return refundService.getAllRefunds();
    }

    // Only SUPER_ADMIN can delete
    @DeleteMapping("/{refundId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public void deleteRefund(@PathVariable Long refundId) {
        refundService.deleteRefund(refundId);
    }
}