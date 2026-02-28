package com.chatbot.travel.controller;

import com.chatbot.travel.model.Refund;
import com.chatbot.travel.service.RefundService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {

    private final RefundService refundService;

    public RefundController(RefundService refundService) {
        this.refundService = refundService;
    }

    //  Request refund
    @PostMapping("/request/{ticketId}")
    public Refund requestRefund(@PathVariable Long ticketId,
                                @RequestParam String reason) {
        return refundService.requestRefundByTicketId(ticketId, reason);
    }

    //  Approve refund
    @PutMapping("/approve/{refundId}")
    public Refund approveRefund(@PathVariable Long refundId) {
        return refundService.approveRefund(refundId);
    }

    //  Reject refund
    @PutMapping("/reject/{refundId}")
    public Refund rejectRefund(@PathVariable Long refundId) {
        return refundService.rejectRefund(refundId);
    }

    //  Get all refunds
    @GetMapping
    public List<Refund> getAllRefunds() {
        return refundService.getAllRefunds();
    }

    // Get refund by ID
    @GetMapping("/{refundId}")
    public Refund getRefundById(@PathVariable Long refundId) {
        return refundService.getRefundById(refundId);
    }

    //  Delete refund
    @DeleteMapping("/{refundId}")
    public void deleteRefund(@PathVariable Long refundId) {
        refundService.deleteRefund(refundId);
    }
}