package com.chatbot.travel.model;

import com.chatbot.travel.model.enums.RefundStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "refunds")
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long refundId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ticket_id", nullable = false, unique = true)
    private Ticket ticket;

    @Column(nullable = false)
    private BigDecimal refundAmount;

    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RefundStatus refundStatus = RefundStatus.PENDING;

    // Automatically set when created
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime processedAt;

    // ================= CONSTRUCTOR =================
    public Refund() {}

    // ================= GETTERS =================
    public Long getRefundId() {
        return refundId;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public String getReason() {
        return reason;
    }

    public RefundStatus getRefundStatus() {
        return refundStatus;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    // ================= SETTERS =================
    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setRefundStatus(RefundStatus refundStatus) {
        this.refundStatus = refundStatus;
    }

    // ✅ FIX: Add this setter
    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
}