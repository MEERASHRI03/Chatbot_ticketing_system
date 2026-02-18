package com.chatbot.travel.service;

import com.chatbot.travel.model.Booking;
import com.chatbot.travel.model.Place;
import com.chatbot.travel.model.User;
import com.chatbot.travel.repository.BookingRepository;
import com.chatbot.travel.repository.PlaceRepository;
import com.chatbot.travel.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          PlaceRepository placeRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.placeRepository = placeRepository;
    }

    @Transactional
    public Booking createBooking(Booking booking) {

        // ✅ Accept either booking.user.userId OR booking.userId
        Long userId = (booking.getUser() != null) ? booking.getUser().getUserId() : booking.getUserId();
        Long placeId = (booking.getPlace() != null) ? booking.getPlace().getPlaceId() : booking.getPlaceId();

        if (userId == null) throw new RuntimeException("Booking must reference a valid userId");
        if (placeId == null) throw new RuntimeException("Booking must reference a valid placeId");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new RuntimeException("Place not found"));

        booking.setUser(user);
        booking.setPlace(place);

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long bookingId) {
        if (bookingId == null) throw new IllegalArgumentException("Booking id cannot be null");
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
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

        // allow counts (0 is valid)
        existing.setAdultCount(updated.getAdultCount());
        existing.setChildCount(updated.getChildCount());

        if (updated.getTotalAmount() != null) existing.setTotalAmount(updated.getTotalAmount());
        if (updated.getBookingStatus() != null) existing.setBookingStatus(updated.getBookingStatus());
        if (updated.getPaymentId() != null) existing.setPaymentId(updated.getPaymentId());

        // ✅ allow changing place reference (either via updated.place.placeId OR updated.placeId)
        Long placeId = (updated.getPlace() != null) ? updated.getPlace().getPlaceId() : updated.getPlaceId();
        if (placeId != null) {
            Place place = placeRepository.findById(placeId)
                    .orElseThrow(() -> new RuntimeException("Place not found"));
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
}
