package com.chatbot.travel.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.chatbot.travel.model.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "payments")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    // 🔹 Booking Mapping (required by both old and new plan)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    // 🔹 User Mapping (nullable = true for guest chatbot bookings)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(nullable = false)
    private BigDecimal amount;

    // Legacy transaction identifier - nullable to allow pure Razorpay flows
    @Column(nullable = true)
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    private String paymentMethod = "RAZORPAY";

    // Created Time
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Actual Payment Time
    private LocalDateTime paymentDate;

    // 🔹 Razorpay Fields (Required for new plan)
    @Column(length = 100)
    private String razorpayOrderId;

    @Column(length = 100)
    private String razorpayPaymentId;

    @Column(length = 500)
    private String razorpaySignature;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.paymentStatus == null) {
            this.paymentStatus = PaymentStatus.PENDING;
        }
        if (this.paymentMethod == null) {
            this.paymentMethod = "RAZORPAY";
        }
        if (this.transactionId == null) {
            this.transactionId = this.razorpayPaymentId != null ? this.razorpayPaymentId :
                    (this.razorpayOrderId != null ? this.razorpayOrderId : "TXN_" + System.currentTimeMillis());
        }
    }

    public Payment() {
    }

    // Specification aliases: id <-> paymentId, status <-> paymentStatus
    public Long getId() {
        return paymentId;
    }

    public void setId(Long id) {
        this.paymentId = id;
    }

    public PaymentStatus getStatus() {
        return paymentStatus;
    }

    public void setStatus(PaymentStatus status) {
        this.paymentStatus = status;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public String getRazorpaySignature() {
        return razorpaySignature;
    }

    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }
}