package com.chatbot.travel.repository;

import com.chatbot.travel.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUser_UserId(Long userId);

    List<Booking> findByPlace_PlaceId(Long placeId);

    java.util.Optional<Booking> findByBookingRef(String bookingRef);

    java.util.Optional<Booking> findTopBySessionIdOrderByCreatedAtDesc(String sessionId);

    List<Booking> findBySessionId(String sessionId);

    // Count total confirmed/paid visitors for a place on a specific date using native SQL
    @Query(value = """
        SELECT COALESCE(SUM(b.adult_count + b.child_count), 0)
        FROM bookings b
        WHERE b.place_id = :placeId
        AND b.visit_date = :visitDate
        AND b.booking_status IN ('CONFIRMED', 'PAID')
    """, nativeQuery = true)
    int countConfirmedVisitors(Long placeId, LocalDate visitDate);
}
