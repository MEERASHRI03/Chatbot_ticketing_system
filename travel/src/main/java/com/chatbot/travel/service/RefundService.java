package com.chatbot.travel.service;

import com.chatbot.travel.model.Refund;
import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.model.enums.RefundStatus;
import com.chatbot.travel.repository.RefundRepository;
import com.chatbot.travel.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RefundService {

    private final RefundRepository refundRepository;
    private final TicketRepository ticketRepository;

    public RefundService(RefundRepository refundRepository, TicketRepository ticketRepository) {
        this.refundRepository = refundRepository;
        this.ticketRepository = ticketRepository;
    }

    //  Create refund
    public Refund requestRefundByTicketId(Long ticketId, String reason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (refundRepository.findByTicket(ticket).isPresent()) {
            throw new RuntimeException("Refund already requested for this ticket");
        }

        Refund refund = new Refund();
        refund.setTicket(ticket);
        refund.setRefundAmount(ticket.getAmount()); // Refund full amount
        refund.setReason(reason);
        refund.setRefundStatus(RefundStatus.PENDING);

        return refundRepository.save(refund);
    }

    //  Approve refund
    public Refund approveRefund(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));

        refund.setRefundStatus(RefundStatus.APPROVED);
        refund.setProcessedAt(LocalDateTime.now());
        return refundRepository.save(refund);
    }

    //  Reject refund
    public Refund rejectRefund(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));

        refund.setRefundStatus(RefundStatus.REJECTED);
        refund.setProcessedAt(LocalDateTime.now());
        return refundRepository.save(refund);
    }

    //  Get all refunds
    public List<Refund> getAllRefunds() {
        return refundRepository.findAll();
    }

    // Get refund by ID
    public Refund getRefundById(Long refundId) {
        return refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));
    }

    //  Delete refund
    public void deleteRefund(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));
        refundRepository.delete(refund);
    }
}