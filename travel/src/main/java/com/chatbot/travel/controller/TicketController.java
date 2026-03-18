package com.chatbot.travel.controller;

import com.chatbot.travel.dto.CancelTicketRequest;
import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public Ticket createTicket(@Valid @RequestBody Ticket ticket) {
        return ticketService.createTicket(ticket);
    }

    @GetMapping
    public List<Ticket> getAllTickets() {
        return ticketService.getAllTickets();
    }

    @GetMapping("/{id}")
    public Ticket getById(@PathVariable Long id) {
        return ticketService.getTicketById(id);
    }

    @PutMapping("/{id}")
    public Ticket updateTicket(@PathVariable Long id,
                               @Valid @RequestBody Ticket ticket) {
        return ticketService.updateTicket(id, ticket);
    }

    // UPDATED CANCEL WITH REASON
    @PutMapping("/cancel/{id}")
    public Ticket cancelTicket(@PathVariable Long id,
                               @RequestBody CancelTicketRequest request) {

        return ticketService.cancelTicket(id, request.getReason());
    }

    @PutMapping("/used/{id}")
    public Ticket markAsUsed(@PathVariable Long id) {
        return ticketService.markAsUsed(id);
    }

    @DeleteMapping("/{id}")
    public void deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
    }

    @GetMapping("/date/{date}")
    public List<Ticket> getByDate(
            @PathVariable
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return ticketService.getByVisitDate(date);
    }

    @GetMapping("/booking/{bookingId}")
    public Ticket getTicketByBooking(@PathVariable Long bookingId) {
        return ticketService.getTicketByBookingId(bookingId);
    }
}