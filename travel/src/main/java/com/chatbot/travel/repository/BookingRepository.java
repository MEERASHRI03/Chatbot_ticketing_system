package com.chatbot.travel.repository;

import com.chatbot.travel.model.Booking;
import com.chatbot.travel.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUser_UserId(Long userId);

    List<Booking> findByPlace_PlaceId(Long placeId);

    // Count total confirmed visitors for a place on a specific date
    @Query("""
        SELECT COALESCE(SUM(b.adultCount + b.childCount), 0)
        FROM Booking b
        WHERE b.place.placeId = :placeId
        AND b.visitDate = :visitDate
        AND b.bookingStatus = 'CONFIRMED'
    """)
    int countConfirmedVisitors(Long placeId, LocalDate visitDate);
}