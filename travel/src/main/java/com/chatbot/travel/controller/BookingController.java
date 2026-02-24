package com.chatbot.travel.controller;

import com.chatbot.travel.model.Booking;
import com.chatbot.travel.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody Booking booking) {
        Booking saved = bookingService.createBooking(booking);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long bookingId) {
        return ResponseEntity.ok(bookingService.getBookingById(bookingId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long bookingId, @Valid @RequestBody Booking booking) {
        return ResponseEntity.ok(bookingService.updateBooking(bookingId, booking));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<String> deleteBooking(@PathVariable Long bookingId) {
        bookingService.deleteBooking(bookingId);
        return ResponseEntity.ok("Booking deleted successfully");
    }

    @GetMapping("/my")
    public List<Booking> myBookings(@RequestParam Long userId) {
        return bookingService.getMyBookings(userId);
    }

    @GetMapping("/admin")
    public List<Booking> allBookingsForAdmin() {
        return bookingService.getAllBookingsForAdmin();
    }

    @PutMapping("/cancel/{id}")
    public Booking cancelBooking(@PathVariable Long id) {
        return bookingService.cancelBooking(id);
    }
}
