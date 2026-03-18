package com.chatbot.travel.service;

import com.chatbot.travel.model.Booking;
import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.model.enums.BookingStatus;
import com.chatbot.travel.model.enums.TicketStatus;
import com.chatbot.travel.repository.BookingRepository;
import com.chatbot.travel.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final RefundService refundService;

    public TicketService(TicketRepository ticketRepository,
                         BookingRepository bookingRepository,
                         RefundService refundService) {

        this.ticketRepository = ticketRepository;
        this.bookingRepository = bookingRepository;
        this.refundService = refundService;
    }

    public Ticket createTicket(Ticket ticket) {

        Booking booking = bookingRepository.findById(
                ticket.getBooking().getBookingId()
        ).orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getBookingStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException(
                    "Ticket cannot be generated. Booking not confirmed."
            );
        }

        if (ticketRepository.existsByBooking(booking)) {
            throw new RuntimeException(
                    "Ticket already generated for this booking."
            );
        }

        ticket.setBooking(booking);
        ticket.setPlaceName(booking.getPlace().getName());
        ticket.setVisitDate(booking.getVisitDate());
        ticket.setNumberOfVisitors(
                booking.getAdultCount() + booking.getChildCount()
        );
        ticket.setAmount(booking.getTotalAmount());
        ticket.setTicketStatus(TicketStatus.ACTIVE);

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public Ticket updateTicket(Long id, Ticket ticket) {

        Ticket existing = getTicketById(id);

        existing.setVisitDate(ticket.getVisitDate());
        existing.setNumberOfVisitors(ticket.getNumberOfVisitors());
        existing.setAmount(ticket.getAmount());

        return ticketRepository.save(existing);
    }

    // CANCEL TICKET + AUTO REFUND
    @Transactional
    public Ticket cancelTicket(Long id, String reason) {

        Ticket ticket = getTicketById(id);

        if (ticket.getTicketStatus() != TicketStatus.ACTIVE) {
            throw new RuntimeException(
                    "Only ACTIVE tickets can be cancelled. Current status: "
                            + ticket.getTicketStatus()
            );
        }

        // cancel ticket
        ticket.setTicketStatus(TicketStatus.CANCELLED);

        // cancel booking
        Booking booking = ticket.getBooking();
        if (booking != null) {
            booking.setBookingStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
        }

        // AUTO CREATE REFUND
        refundService.createRefundForCancelledTicket(ticket, reason);

        return ticketRepository.save(ticket);
    }

    public Ticket markAsUsed(Long id) {

        Ticket ticket = getTicketById(id);

        if (ticket.getTicketStatus() != TicketStatus.ACTIVE) {
            throw new RuntimeException(
                    "Only ACTIVE tickets can be marked as USED."
            );
        }

        if (ticket.getVisitDate() == null ||
                ticket.getVisitDate().isAfter(LocalDate.now())) {

            throw new RuntimeException(
                    "Ticket cannot be used before visit date."
            );
        }

        ticket.setTicketStatus(TicketStatus.USED);

        return ticketRepository.save(ticket);
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    public List<Ticket> getByVisitDate(LocalDate date) {
        return ticketRepository.findByVisitDate(date);
    }

    public Ticket getTicketByBookingId(Long bookingId) {
        return ticketRepository.findByBookingBookingId(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Ticket not found for booking"));
    }
}