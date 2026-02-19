package com.chatbot.travel.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.chatbot.travel.model.Booking;
import com.chatbot.travel.model.Payment;
import com.chatbot.travel.model.User;
import com.chatbot.travel.repository.BookingRepository;
import com.chatbot.travel.repository.PaymentRepository;
import com.chatbot.travel.repository.UserRepository;

@Service
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          UserRepository userRepository,
                          BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    public Payment createPayment(Payment payment) {

        // Fetch user from DB
        User user = userRepository.findById(payment.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch booking from DB
        Booking booking = bookingRepository.findById(payment.getBooking().getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Set managed entities
        payment.setUser(user);
        payment.setBooking(booking);

        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public Payment updatePayment(Long id, Payment payment) {
        Payment existing = getPaymentById(id);

        existing.setAmount(payment.getAmount());
        existing.setPaymentMethod(payment.getPaymentMethod());
        existing.setPaymentStatus(payment.getPaymentStatus());
        existing.setTransactionId(payment.getTransactionId());

        return paymentRepository.save(existing);
    }

    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }

    public List<Payment> getPaymentsByUser(Long userId) {
        return paymentRepository.findByUser_UserId(userId);
    }

}
