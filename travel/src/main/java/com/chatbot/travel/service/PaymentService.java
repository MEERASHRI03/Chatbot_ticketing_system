package com.chatbot.travel.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.chatbot.travel.model.Booking;
import com.chatbot.travel.model.Payment;
import com.chatbot.travel.model.Ticket;
import com.chatbot.travel.model.User;
import com.chatbot.travel.model.enums.BookingStatus;
import com.chatbot.travel.model.enums.PaymentStatus;
import com.chatbot.travel.model.enums.TicketStatus;
import com.chatbot.travel.repository.BookingRepository;
import com.chatbot.travel.repository.PaymentRepository;
import com.chatbot.travel.repository.TicketRepository;
import com.chatbot.travel.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          UserRepository userRepository,
                          BookingRepository bookingRepository,
                          TicketRepository ticketRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional
    public Payment createPayment(Payment payment) {

        // Fetch user
        User user = userRepository.findById(payment.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch booking
        Booking booking = bookingRepository.findById(payment.getBooking().getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Prevent double payment
        if (booking.getBookingStatus() == BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking already paid");
        }

        payment.setUser(user);
        payment.setBooking(booking);
        payment.setPaymentDate(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        // AUTOMATED WORKFLOW
        if (savedPayment.getPaymentStatus() == PaymentStatus.SUCCESS) {

            // 1️⃣ Confirm Booking
            booking.setBookingStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            // 2️⃣ Auto Create Ticket
            Ticket ticket = new Ticket();
            ticket.setBooking(booking);
            ticket.setPlaceName(booking.getPlace().getName());
            ticket.setVisitDate(booking.getVisitDate());
            ticket.setNumberOfVisitors(
                    booking.getAdultCount() + booking.getChildCount()
            );
            ticket.setAmount(booking.getTotalAmount());
            ticket.setTicketStatus(TicketStatus.ACTIVE);

            ticketRepository.save(ticket);
        }

        return savedPayment;
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