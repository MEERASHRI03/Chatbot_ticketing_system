package com.chatbot.travel.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chatbot.travel.model.*;
import com.chatbot.travel.model.enums.Role;
import com.chatbot.travel.model.enums.BookingStatus;
import com.chatbot.travel.model.enums.PaymentStatus;
import com.chatbot.travel.model.enums.TicketStatus;
import com.chatbot.travel.repository.*;

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

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public Payment createPayment(Payment payment) {

        User user = userRepository.findById(payment.getUser().getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(payment.getBooking().getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getBookingStatus() == BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking already paid");
        }

        payment.setUser(user);
        payment.setBooking(booking);
        payment.setPaymentDate(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        if (savedPayment.getPaymentStatus() == PaymentStatus.SUCCESS) {

            booking.setBookingStatus(BookingStatus.CONFIRMED);

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
        User currentUser = getCurrentUser();

        if (currentUser.getRole() == Role.REGIONAL_ADMIN) {
            return paymentRepository.findByBooking_Place_Region(currentUser.getRegion());
        }

        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));

        User currentUser = getCurrentUser();
        if (currentUser.getRole() == Role.REGIONAL_ADMIN &&
                !payment.getBooking().getPlace().getRegion().equals(currentUser.getRegion())) {
            throw new RuntimeException("You cannot access payment outside your region");
        }

        return payment;
    }

    @Transactional
    public Payment updatePayment(Long id, Payment payment) {

        Payment existing = getPaymentById(id);

        existing.setAmount(payment.getAmount());
        existing.setPaymentMethod(payment.getPaymentMethod());
        existing.setPaymentStatus(payment.getPaymentStatus());
        existing.setTransactionId(payment.getTransactionId());

        return existing;
    }

    @Transactional
    public void deletePayment(Long id) {
        Payment payment = getPaymentById(id);
        paymentRepository.delete(payment);
    }

    public List<Payment> getPaymentsByUser(Long userId) {
        return paymentRepository.findByUser_UserId(userId);
    }
}
