package com.chatbot.travel.repository;

import com.chatbot.travel.model.Refund;
import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.model.enums.Region;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefundRepository extends JpaRepository<Refund, Long> {

    //  Check if refund already exists for a ticket
    Optional<Refund> findByTicket(Ticket ticket);

    Optional<Refund> findByTicketTicketId(Long ticketId);

    List<Refund> findByTicket_Booking_Place_Region(Region region);

}
