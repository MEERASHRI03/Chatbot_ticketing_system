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

    private final RefundRepository refundRepository;

    public RefundService(RefundRepository refundRepository) {
        this.refundRepository = refundRepository;
    }

    @Transactional
    public Refund createRefundForCancelledTicket(Ticket ticket, String reason) {

        if (refundRepository.findByTicket(ticket).isPresent()) {
            return refundRepository.findByTicket(ticket).get();
        }

        Refund refund = new Refund();

        refund.setTicket(ticket);
        refund.setRefundAmount(ticket.getAmount());
        refund.setReason(reason);
        refund.setRefundStatus(RefundStatus.PENDING);

        return refundRepository.save(refund);
    }

    @Transactional
    public Refund approveRefund(Long refundId) {

        Refund refund = getRefundById(refundId);

        refund.setRefundStatus(RefundStatus.APPROVED);
        refund.setProcessedAt(LocalDateTime.now());

        return refundRepository.save(refund);
    }

    @Transactional
    public Refund rejectRefund(Long refundId) {

        Refund refund = getRefundById(refundId);

        refund.setRefundStatus(RefundStatus.REJECTED);
        refund.setProcessedAt(LocalDateTime.now());

        return refundRepository.save(refund);
    }

    public List<Refund> getAllRefunds() {
        return refundRepository.findAll();
    }

    public Refund getRefundById(Long refundId) {
        return refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));
    }

    public Refund getRefundByTicketId(Long ticketId) {

        return refundRepository.findByTicketTicketId(ticketId)
                .orElseThrow(() ->
                        new RuntimeException("Refund not found for ticket"));
    }
}