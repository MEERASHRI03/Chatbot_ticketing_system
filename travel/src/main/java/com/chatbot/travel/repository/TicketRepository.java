package com.chatbot.travel.repository;

import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.model.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

   Optional<Ticket> findByTicketNumber(String ticketNumber);

    Optional<Ticket> findByQrCode(String qrCode);

    Optional<Ticket> findByBooking_BookingId(Long bookingId);

    List<Ticket> findByTicketStatus(TicketStatus status);

    List<Ticket> findByVisitDate(LocalDate visitDate);
}
