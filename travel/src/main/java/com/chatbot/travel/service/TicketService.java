package com.chatbot.travel.service;

import com.chatbot.travel.model.Booking;
import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.model.enums.BookingStatus;
import com.chatbot.travel.model.enums.TicketStatus;
import com.chatbot.travel.repository.BookingRepository;
import com.chatbot.travel.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;

    public TicketService(TicketRepository ticketRepository,
                         BookingRepository bookingRepository) {
        this.ticketRepository = ticketRepository;
        this.bookingRepository = bookingRepository;
    }

    // SAFE MANUAL TICKET CREATION
    public Ticket createTicket(Ticket ticket) {

        // Fetch booking
        Booking booking = bookingRepository.findById(
                ticket.getBooking().getBookingId()
        ).orElseThrow(() -> new RuntimeException("Booking not found"));

        // Allow only CONFIRMED booking
        if (booking.getBookingStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException(
                    "Ticket cannot be generated. Booking not confirmed."
            );
        }

        // Prevent duplicate ticket
        if (ticketRepository.existsByBooking(booking)) {
            throw new RuntimeException(
                    "Ticket already generated for this booking."
            );
        }

        // Auto-fill business fields
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

    public Ticket cancelTicket(Long id) {
        Ticket ticket = getTicketById(id);

        // Only ACTIVE tickets can be cancelled
        if (ticket.getTicketStatus() != TicketStatus.ACTIVE) {
            throw new RuntimeException(
                "Only ACTIVE tickets can be cancelled. Current status: " + ticket.getTicketStatus()
            );
        }

        ticket.setTicketStatus(TicketStatus.CANCELLED);
        return ticketRepository.save(ticket);
    }

    public Ticket markAsUsed(Long id) {
        Ticket ticket = getTicketById(id);

        // Only ACTIVE tickets can be marked as USED
        if (ticket.getTicketStatus() != TicketStatus.ACTIVE) {
            throw new RuntimeException(
                "Only ACTIVE tickets can be marked as USED. Current status: " + ticket.getTicketStatus()
            );
        }

        // Check if the visit date has arrived
        if (ticket.getVisitDate() == null || ticket.getVisitDate().isAfter(java.time.LocalDate.now())) {
            throw new RuntimeException(
                "Ticket cannot be used before the visit date: " + ticket.getVisitDate()
            );
        }

        ticket.setTicketStatus(TicketStatus.USED);
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    public List<Ticket> getByVisitDate(java.time.LocalDate date) {
        return ticketRepository.findByVisitDate(date);
    }
}