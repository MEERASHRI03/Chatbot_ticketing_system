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

    // USER CAN VIEW REFUND
    @GetMapping("/{refundId}")
    public Refund getRefundById(@PathVariable Long refundId) {
        return refundService.getRefundById(refundId);
    }

    // USER REQUEST REFUND
@PostMapping("/request/{ticketId}")
@PreAuthorize("hasRole('USER')")
public Refund requestRefund(@PathVariable Long ticketId,
                            @RequestParam String reason) {
    return refundService.requestRefundByTicketId(ticketId, reason);
}

    // ADMIN APPROVE
    @PutMapping("/approve/{refundId}")
    @PreAuthorize("hasAnyRole('REGIONAL_ADMIN','SUPER_ADMIN')")
    public Refund approveRefund(@PathVariable Long refundId) {
        return refundService.approveRefund(refundId);
    }

    // ADMIN REJECT
    @PutMapping("/reject/{refundId}")
    @PreAuthorize("hasAnyRole('REGIONAL_ADMIN','SUPER_ADMIN')")
    public Refund rejectRefund(@PathVariable Long refundId) {
        return refundService.rejectRefund(refundId);
    }

    // ADMIN VIEW ALL
    @GetMapping
    @PreAuthorize("hasAnyRole('REGIONAL_ADMIN','SUPER_ADMIN')")
    public List<Refund> getAllRefunds() {
        return refundService.getAllRefunds();
    }

    @GetMapping("/ticket/{ticketId}")
    public Refund getRefundByTicket(@PathVariable Long ticketId) {
        return refundService.getRefundByTicketId(ticketId);
    }
}