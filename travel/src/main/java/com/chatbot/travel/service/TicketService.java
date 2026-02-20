package com.chatbot.travel.service;

import com.chatbot.travel.model.Booking;
import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.model.enums.TicketStatus;
import com.chatbot.travel.repository.BookingRepository;
import com.chatbot.travel.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

    public Ticket createTicket(Ticket ticket) {

        Long bookingId = ticket.getBooking().getBookingId();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        ticket.setBooking(booking);

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public Ticket updateTicket(Long id, Ticket updatedTicket) {
        Ticket existing = getTicketById(id);

        if (existing.getTicketStatus() == TicketStatus.CANCELLED) {
            throw new RuntimeException("Cancelled ticket cannot be updated");
        }

        existing.setPlaceName(updatedTicket.getPlaceName());
        existing.setVisitDate(updatedTicket.getVisitDate());
        existing.setNumberOfVisitors(updatedTicket.getNumberOfVisitors());
        existing.setAmount(updatedTicket.getAmount());

        return ticketRepository.save(existing);
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    public Ticket cancelTicket(Long id) {
        Ticket ticket = getTicketById(id);
        ticket.setTicketStatus(TicketStatus.CANCELLED);
        return ticketRepository.save(ticket);
    }

    public Ticket markAsUsed(Long id) {
        Ticket ticket = getTicketById(id);
        ticket.setTicketStatus(TicketStatus.USED);
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getByVisitDate(LocalDate date) {
        return ticketRepository.findByVisitDate(date);
    }
}