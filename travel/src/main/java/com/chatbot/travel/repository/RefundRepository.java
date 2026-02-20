package com.chatbot.travel.repository;

import com.chatbot.travel.model.Refund;
import com.chatbot.travel.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefundRepository extends JpaRepository<Refund, Long> {

    //  Check if refund already exists for a ticket
    Optional<Refund> findByTicket(Ticket ticket);

    // Optional helper if needed
    // Optional<Refund> findByTicket_TicketId(Long ticketId);
}