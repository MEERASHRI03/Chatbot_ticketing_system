package com.chatbot.travel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chatbot.travel.model.Payment;
import com.chatbot.travel.model.enums.Region;

public interface PaymentRepository extends JpaRepository <Payment, Long>{
    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findByBooking_BookingId(Long bookingId);

    List<Payment> findByUser_UserId(Long userId);

    List<Payment> findByBooking_Place_Region(Region region);
    
}
