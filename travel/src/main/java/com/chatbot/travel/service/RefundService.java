package com.chatbot.travel.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chatbot.travel.model.Refund;
import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.model.enums.RefundStatus;
import com.chatbot.travel.repository.RefundRepository;
import com.chatbot.travel.repository.TicketRepository;

@Service
public class RefundService {

    private RefundRepository refundRepository;
    private TicketRepository ticketRepository;

    // ✅ Manual Constructor Injection (No Lombok)
    public RefundService(RefundRepository refundRepository,
                         TicketRepository ticketRepository) {
        this.refundRepository = refundRepository;
        this.ticketRepository = ticketRepository;
    }

    // ===============================
    // Create Refund Request
    // ===============================
    @Transactional
    public Refund requestRefundByTicketId(Long ticketId, String reason) {

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (refundRepository.findByTicket(ticket).isPresent()) {
            throw new RuntimeException("Refund already requested for this ticket");
        }

        Refund refund = new Refund();
        refund.setTicket(ticket);
        refund.setRefundAmount(ticket.getAmount());
        refund.setReason(reason);
        refund.setRefundStatus(RefundStatus.PENDING);

        return refundRepository.save(refund);
    }

    // ===============================
    // Approve Refund
    // ===============================
    @Transactional
    public Refund approveRefund(Long refundId) {

        Refund refund = getRefundById(refundId);

        refund.setRefundStatus(RefundStatus.APPROVED);
        refund.setProcessedAt(LocalDateTime.now());

        return refund;
    }

    // ===============================
    // Reject Refund
    // ===============================
    @Transactional
    public Refund rejectRefund(Long refundId) {

        Refund refund = getRefundById(refundId);

        refund.setRefundStatus(RefundStatus.REJECTED);
        refund.setProcessedAt(LocalDateTime.now());

        return refund;
    }

    // ===============================
    // Get All Refunds
    // ===============================
    public List<Refund> getAllRefunds() {
        return refundRepository.findAll();
    }

    // ===============================
    // Get Refund By ID
    // ===============================
    public Refund getRefundById(Long refundId) {
        return refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found with id: " + refundId));
    }

    // ===============================
    // Delete Refund
    // ===============================
    @Transactional
    public void deleteRefund(Long refundId) {
        Refund refund = getRefundById(refundId);
        refundRepository.delete(refund);
    }
}