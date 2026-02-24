package com.chatbot.travel.service;

import com.chatbot.travel.model.Booking;
import com.chatbot.travel.model.Place;
import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.model.Refund;
import com.chatbot.travel.model.User;
import com.chatbot.travel.model.enums.BookingStatus;
import com.chatbot.travel.model.enums.TicketStatus;
import com.chatbot.travel.model.enums.RefundStatus;
import com.chatbot.travel.repository.BookingRepository;
import com.chatbot.travel.repository.PlaceRepository;
import com.chatbot.travel.repository.UserRepository;
import com.chatbot.travel.repository.TicketRepository;
import com.chatbot.travel.repository.RefundRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;
    private final TicketRepository ticketRepository;
    private final RefundRepository refundRepository;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          PlaceRepository placeRepository,
                          TicketRepository ticketRepository,
                          RefundRepository refundRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.placeRepository = placeRepository;
        this.ticketRepository = ticketRepository;
        this.refundRepository = refundRepository;
    }

    @Transactional
    public Booking createBooking(Booking booking) {

        Long userId = (booking.getUser() != null) ? booking.getUser().getUserId() : booking.getUserId();
        Long placeId = (booking.getPlace() != null) ? booking.getPlace().getPlaceId() : booking.getPlaceId();

        if (userId == null) throw new RuntimeException("Booking must reference a valid userId");
        if (placeId == null) throw new RuntimeException("Booking must reference a valid placeId");

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Place place = placeRepository.findById(placeId).orElseThrow(() -> new RuntimeException("Place not found"));

        booking.setUser(user);
        booking.setPlace(place);
        booking.setBookingStatus(BookingStatus.PENDING); // Default workflow state

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long bookingId) {
        if (bookingId == null) throw new IllegalArgumentException("Booking id cannot be null");
        return bookingRepository.findById(bookingId).orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        if (userId == null) throw new IllegalArgumentException("User id cannot be null");
        return bookingRepository.findByUser_UserId(userId);
    }

    @Transactional
    public Booking updateBooking(Long bookingId, Booking updated) {
        Booking existing = getBookingById(bookingId);

        if (updated.getVisitDate() != null) existing.setVisitDate(updated.getVisitDate());
        if (updated.getTimeSlot() != null) existing.setTimeSlot(updated.getTimeSlot());

        existing.setAdultCount(updated.getAdultCount());
        existing.setChildCount(updated.getChildCount());

        if (updated.getTotalAmount() != null) existing.setTotalAmount(updated.getTotalAmount());
        if (updated.getBookingStatus() != null) existing.setBookingStatus(updated.getBookingStatus());

        Long placeId = (updated.getPlace() != null) ? updated.getPlace().getPlaceId() : updated.getPlaceId();
        if (placeId != null) {
            Place place = placeRepository.findById(placeId).orElseThrow(() -> new RuntimeException("Place not found"));
            existing.setPlace(place);
        }

        return bookingRepository.save(existing);
    }

    public void deleteBooking(Long bookingId) {
        if (bookingId == null) throw new IllegalArgumentException("Booking id cannot be null");
        if (!bookingRepository.existsById(bookingId)) throw new RuntimeException("Booking not found");
        bookingRepository.deleteById(bookingId);
    }

    public List<Booking> getMyBookings(Long userId) {
        return bookingRepository.findByUser_UserId(userId);
    }

    public List<Booking> getAllBookingsForAdmin() {
        return bookingRepository.findAll();
    }

    // ================== NEW: CANCEL BOOKING WORKFLOW ==================
    @Transactional
    public Booking cancelBooking(Long bookingId, String reason) {

    Booking booking = getBookingById(bookingId);

    if (booking.getBookingStatus() != BookingStatus.CONFIRMED) {
        throw new RuntimeException("Only CONFIRMED bookings can be cancelled.");
    }

    // 1️⃣ Cancel booking
    booking.setBookingStatus(BookingStatus.CANCELLED);
    bookingRepository.save(booking);

    // 2️⃣ Cancel ticket if present
    ticketRepository.findByBooking_BookingId(bookingId).ifPresent(ticket -> {
        ticket.setTicketStatus(TicketStatus.CANCELLED);
        ticketRepository.save(ticket);

        // 3️⃣ Create refund
        Refund refund = new Refund();
        refund.setTicket(ticket);
        refund.setRefundAmount(booking.getTotalAmount());
        refund.setRefundStatus(RefundStatus.PENDING);
        refund.setReason(reason);
        refundRepository.save(refund);
    });

        return booking;
    }

    @Transactional
    public Booking cancelBooking(Long bookingId) {
    Booking booking = getBookingById(bookingId);

    // Only CONFIRMED bookings can be cancelled
    if (booking.getBookingStatus() != BookingStatus.CONFIRMED) {
        throw new RuntimeException("Only CONFIRMED bookings can be cancelled.");
    }

    // 1️⃣ Update booking status
    booking.setBookingStatus(BookingStatus.CANCELLED);
    bookingRepository.save(booking);

    // 2️⃣ Update ticket status
    Ticket ticket = ticketRepository.findByBooking(booking);
    if (ticket != null) {
        ticket.setTicketStatus(TicketStatus.CANCELLED);
        ticketRepository.save(ticket);
    }

    // 3️⃣ Create a refund (linked to ticket)
    if (ticket != null) {
        Refund refund = new Refund();
        refund.setTicket(ticket);
        refund.setRefundAmount(booking.getTotalAmount());
        refund.setRefundStatus(RefundStatus.PENDING);
        refundRepository.save(refund);
    }

    return booking;
}
}