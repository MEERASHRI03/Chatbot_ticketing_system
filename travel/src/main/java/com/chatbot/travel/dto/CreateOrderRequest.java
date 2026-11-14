package com.chatbot.travel.dto;

public class CreateOrderRequest {
    private Long bookingId;
    private String bookingRef;
    private Long userId;
    private Integer amount;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(Long bookingId, String bookingRef, Long userId, Integer amount) {
        this.bookingId = bookingId;
        this.bookingRef = bookingRef;
        this.userId = userId;
        this.amount = amount;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getBookingRef() {
        return bookingRef;
    }

    public void setBookingRef(String bookingRef) {
        this.bookingRef = bookingRef;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }
}
