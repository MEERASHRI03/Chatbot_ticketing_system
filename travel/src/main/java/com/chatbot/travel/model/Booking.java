package com.chatbot.travel.model;

import com.chatbot.travel.model.enums.BookingStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "place_id", nullable = false)
    @JsonIgnore
    private Place place;

    // Postman-friendly fields (not stored as columns)
    @Transient
    private Long userId;

    @Transient
    private Long placeId;

    @NotNull(message = "Visit date is required")
    @Column(nullable = false)
    private LocalDate visitDate;

    private String timeSlot;

    @Min(value = 0, message = "Adult count must be zero or positive")
    private int adultCount;

    @Min(value = 0, message = "Child count must be zero or positive")
    private int childCount;

    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus bookingStatus = BookingStatus.PENDING;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Payment payment;


    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.bookingStatus == null) this.bookingStatus = BookingStatus.PENDING;
    }

    public Booking() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Place getPlace() { return place; }
    public void setPlace(Place place) { this.place = place; }

    // ✅ Show userId in API response
    @JsonProperty("userId")
    public Long getUserId() {
        if (user != null) return user.getUserId();
        return userId;
    }

    // ✅ Accept userId in request body
    @JsonProperty("userId")
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // ✅ Show placeId in API response
    @JsonProperty("placeId")
    public Long getPlaceId() {
        if (place != null) return place.getPlaceId();
        return placeId;
    }

    // ✅ Accept placeId in request body
    @JsonProperty("placeId")
    public void setPlaceId(Long placeId) {
        this.placeId = placeId;
    }

    public LocalDate getVisitDate() { return visitDate; }
    public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public int getAdultCount() { return adultCount; }
    public void setAdultCount(int adultCount) { this.adultCount = adultCount; }

    public int getChildCount() { return childCount; }
    public void setChildCount(int childCount) { this.childCount = childCount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BookingStatus getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(BookingStatus bookingStatus) { this.bookingStatus = bookingStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
