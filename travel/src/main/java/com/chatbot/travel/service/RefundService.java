package com.chatbot.travel.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chatbot.travel.model.Refund;
import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.model.User;
import com.chatbot.travel.model.enums.Role;
import com.chatbot.travel.model.enums.RefundStatus;
import com.chatbot.travel.model.enums.TicketStatus;
import com.chatbot.travel.repository.RefundRepository;
import com.chatbot.travel.repository.TicketRepository;
import com.chatbot.travel.repository.UserRepository;

@Service
public class RefundService {

    private final RefundRepository refundRepository;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public RefundService(RefundRepository refundRepository,
                         UserRepository userRepository,
                         TicketRepository ticketRepository) {
        this.refundRepository = refundRepository;
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    // ================= HELPER =================
    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ================= REQUEST REFUND =================
    @Transactional
    public Refund requestRefundByTicketId(Long ticketId, String reason) {

        // 1. Get Ticket
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // 2. Check if already requested
        Optional<Refund> existingRefund = refundRepository.findByTicket(ticket);
        if (existingRefund.isPresent()) {
            throw new RuntimeException("Refund already requested for this ticket");
        }

        // 3. Validate ticket status
        if (ticket.getTicketStatus() != TicketStatus.ACTIVE) {
            throw new RuntimeException("Refund allowed only for ACTIVE tickets");
        }

        // 4. Create refund
        Refund refund = new Refund();
        refund.setTicket(ticket);
        refund.setRefundAmount(ticket.getAmount());
        refund.setReason(reason);
        refund.setRefundStatus(RefundStatus.PENDING);
        refund.setRequestedAt(LocalDateTime.now());

        // 5. (Optional) Cancel ticket automatically
        ticket.setTicketStatus(TicketStatus.CANCELLED);
        ticketRepository.save(ticket);

        return refundRepository.save(refund);
    }

    // ================= AUTO REFUND (ON CANCEL) =================
    @Transactional
    public Refund createRefundForCancelledTicket(Ticket ticket, String reason) {

        Optional<Refund> existingRefund = refundRepository.findByTicket(ticket);
        if (existingRefund.isPresent()) {
            return existingRefund.get();
        }

        Refund refund = new Refund();
        refund.setTicket(ticket);
        refund.setRefundAmount(ticket.getAmount());
        refund.setReason(reason);
        refund.setRefundStatus(RefundStatus.PENDING);
        refund.setRequestedAt(LocalDateTime.now());

        return refundRepository.save(refund);
    }

    // ================= APPROVE =================
    @Transactional
    public Refund approveRefund(Long refundId) {

        Refund refund = getRefundById(refundId);

        refund.setRefundStatus(RefundStatus.APPROVED);


        return refundRepository.save(refund);
    }

    // ================= REJECT =================
    @Transactional
    public Refund rejectRefund(Long refundId) {

        Refund refund = getRefundById(refundId);

        refund.setRefundStatus(RefundStatus.REJECTED);
        refund.setProcessedAt(LocalDateTime.now());

        return refundRepository.save(refund);
    }

    // ================= GET ALL =================
    public List<Refund> getAllRefunds() {

        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.REGIONAL_ADMIN) {
            return refundRepository
                    .findByTicket_Booking_Place_Region(currentUser.getRegion());
        }

        return refundRepository.findAll();
    }

    // ================= GET BY ID =================
    public Refund getRefundById(Long refundId) {

        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));

        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.REGIONAL_ADMIN &&
                !refund.getTicket().getBooking().getPlace().getRegion()
                        .equals(currentUser.getRegion())) {

            throw new RuntimeException("You cannot access refund outside your region");
        }

        return refund;
    }

    // ================= GET BY TICKET =================
    public Refund getRefundByTicketId(Long ticketId) {

        Refund refund = refundRepository.findByTicketTicketId(ticketId)
                .orElseThrow(() ->
                        new RuntimeException("Refund not found for ticket"));

        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.REGIONAL_ADMIN &&
                !refund.getTicket().getBooking().getPlace().getRegion()
                        .equals(currentUser.getRegion())) {

            throw new RuntimeException("You cannot access refund outside your region");
        }

        return refund;
    }
}