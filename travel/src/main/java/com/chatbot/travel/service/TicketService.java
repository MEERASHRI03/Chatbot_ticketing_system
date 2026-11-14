package com.chatbot.travel.service;

import com.chatbot.travel.model.Booking;
import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.model.enums.BookingStatus;
import com.chatbot.travel.model.enums.TicketStatus;
import com.chatbot.travel.repository.BookingRepository;
import com.chatbot.travel.repository.TicketRepository;
import com.chatbot.travel.util.PdfTicketGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);
    private static final String TICKETS_DIR = "storage/tickets";

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

    @Transactional
    public Ticket generateTicketForBooking(Booking booking) {
        if (booking == null) {
            throw new IllegalArgumentException("Booking cannot be null");
        }

        // Idempotency: Never issue two tickets for the same booking
        if (booking.getBookingId() != null) {
            Optional<Ticket> existing = ticketRepository.findByBooking_BookingId(booking.getBookingId());
            if (existing.isPresent()) {
                log.info("Ticket already exists for bookingId={}", booking.getBookingId());
                return existing.get();
            }
        }
        if (booking.getBookingRef() != null) {
            Optional<Ticket> existing = ticketRepository.findByBooking_BookingRef(booking.getBookingRef());
            if (existing.isPresent()) {
                log.info("Ticket already exists for bookingRef={}", booking.getBookingRef());
                return existing.get();
            }
        }

        String ticketNumber = "TKT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        String bookingRef = booking.getBookingRef() != null ? booking.getBookingRef() : "BKG-" + booking.getBookingId();
        String qrPayload = bookingRef + ":" + ticketNumber;

        Ticket ticket = new Ticket();
        ticket.setBooking(booking);
        ticket.setTicketNumber(ticketNumber);
        ticket.setPlaceName(booking.getPlace() != null ? booking.getPlace().getName() : "Heritage Monument");
        ticket.setVisitDate(booking.getVisitDate());
        ticket.setNumberOfVisitors(booking.getAdultCount() + booking.getChildCount());
        ticket.setAmount(booking.getTotalAmount());
        ticket.setTicketStatus(TicketStatus.ACTIVE);
        ticket.setQrPayload(qrPayload);
        ticket.setQrCode(qrPayload);

        try {
            byte[] pdfBytes = PdfTicketGenerator.generateTicketPdf(ticket, booking);
            Path storageDir = Paths.get(TICKETS_DIR);
            Files.createDirectories(storageDir);
            Path pdfFile = storageDir.resolve(ticketNumber + ".pdf");
            Files.write(pdfFile, pdfBytes);
            ticket.setPdfPath(pdfFile.toAbsolutePath().toString());
            log.info("Saved PDF ticket to {}", pdfFile);
        } catch (IOException e) {
            log.error("Failed to write PDF ticket to file: {}", e.getMessage());
        }

        return ticketRepository.save(ticket);
    }

    public Ticket getTicketByBookingRef(String bookingRef) {
        return ticketRepository.findByBooking_BookingRef(bookingRef)
                .or(() -> {
                    // Try by bookingId if numeric or find by bookingRef in bookingRepo
                    return bookingRepository.findByBookingRef(bookingRef)
                            .flatMap(b -> ticketRepository.findByBooking_BookingId(b.getBookingId()));
                })
                .orElseThrow(() -> new RuntimeException("Ticket not found for bookingRef: " + bookingRef));
    }

    public byte[] getTicketPdfByBookingRef(String bookingRef) {
        Ticket ticket = getTicketByBookingRef(bookingRef);
        Booking booking = ticket.getBooking();

        if (ticket.getPdfPath() != null) {
            Path pdfPath = Paths.get(ticket.getPdfPath());
            if (Files.exists(pdfPath)) {
                try {
                    return Files.readAllBytes(pdfPath);
                } catch (IOException e) {
                    log.warn("Failed to read cached PDF file: {}", e.getMessage());
                }
            }
        }

        // Dynamically regenerate PDF if file missing
        try {
            byte[] pdfBytes = PdfTicketGenerator.generateTicketPdf(ticket, booking);
            try {
                Path storageDir = Paths.get(TICKETS_DIR);
                Files.createDirectories(storageDir);
                Path pdfFile = storageDir.resolve(ticket.getTicketNumber() + ".pdf");
                Files.write(pdfFile, pdfBytes);
                ticket.setPdfPath(pdfFile.toAbsolutePath().toString());
                ticketRepository.save(ticket);
            } catch (Exception ignored) {}
            return pdfBytes;
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF for ticket: " + e.getMessage(), e);
        }
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

    public List<Ticket> getTicketsByUserId(Long userId) {
        if (userId == null) {
            return List.of();
        }
        return ticketRepository.findByBooking_User_UserId(userId);
    }
}