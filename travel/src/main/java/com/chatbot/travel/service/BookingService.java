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

import java.time.LocalDate;
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

        Long userId = (booking.getUser() != null)
                ? booking.getUser().getUserId()
                : booking.getUserId();

        Long placeId = (booking.getPlace() != null)
                ? booking.getPlace().getPlaceId()
                : booking.getPlaceId();

        if (userId == null)
            throw new RuntimeException("Booking must reference a valid userId");

        if (placeId == null)
            throw new RuntimeException("Booking must reference a valid placeId");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new RuntimeException("Place not found"));

        if (booking.getVisitDate() == null)
            throw new RuntimeException("Visit date is required");

        if (booking.getVisitDate().isBefore(LocalDate.now()))
            throw new RuntimeException("Cannot book for past dates");

        // CAPACITY CHECK LOGIC
        int requestedVisitors = booking.getAdultCount() + booking.getChildCount();

        if (requestedVisitors <= 0)
            throw new RuntimeException("At least one visitor required");

        int currentVisitors = bookingRepository.countConfirmedVisitors(
                place.getPlaceId(),
                booking.getVisitDate()
        );

        int capacity = place.getAvailableSlots();

        if (currentVisitors + requestedVisitors > capacity) {
            throw new RuntimeException(
                "Booking cannot be completed. Slot full for this place on selected date."
           );
        }

        booking.setUser(user);
        booking.setPlace(place);
        booking.setBookingStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long bookingId) {
        if (bookingId == null)
            throw new IllegalArgumentException("Booking id cannot be null");

        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        if (userId == null)
            throw new IllegalArgumentException("User id cannot be null");

        return bookingRepository.findByUser_UserId(userId);
    }

    public List<Booking> getMyBookings(Long userId) {
        return bookingRepository.findByUser_UserId(userId);
    }

    public List<Booking> getAllBookingsForAdmin() {
        return bookingRepository.findAll();
    }

    @Transactional
    public Booking updateBooking(Long bookingId, Booking updated) {

        Booking existing = getBookingById(bookingId);

        if (updated.getVisitDate() != null)
            existing.setVisitDate(updated.getVisitDate());

        if (updated.getTimeSlot() != null)
            existing.setTimeSlot(updated.getTimeSlot());

        existing.setAdultCount(updated.getAdultCount());
        existing.setChildCount(updated.getChildCount());

        if (updated.getTotalAmount() != null)
            existing.setTotalAmount(updated.getTotalAmount());

        if (updated.getBookingStatus() != null)
            existing.setBookingStatus(updated.getBookingStatus());

        Long placeId = (updated.getPlace() != null)
                ? updated.getPlace().getPlaceId()
                : updated.getPlaceId();

        if (placeId != null) {
            Place place = placeRepository.findById(placeId)
                    .orElseThrow(() -> new RuntimeException("Place not found"));
            existing.setPlace(place);
        }

        return bookingRepository.save(existing);
    }

    public void deleteBooking(Long bookingId) {

        if (bookingId == null)
            throw new IllegalArgumentException("Booking id cannot be null");

        if (!bookingRepository.existsById(bookingId))
            throw new RuntimeException("Booking not found");

        bookingRepository.deleteById(bookingId);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, String reason) {

        Booking booking = getBookingById(bookingId);

        if (booking.getBookingStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Only CONFIRMED bookings can be cancelled.");
        }

        // Cancel booking
        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Cancel ticket if present
        ticketRepository.findByBooking_BookingId(bookingId).ifPresent(ticket -> {

            ticket.setTicketStatus(TicketStatus.CANCELLED);
            ticketRepository.save(ticket);

            // Create refund
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
        return cancelBooking(bookingId, "User requested cancellation");
    }
}