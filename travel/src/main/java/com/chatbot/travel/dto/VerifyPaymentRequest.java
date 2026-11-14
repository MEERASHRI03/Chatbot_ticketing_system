package com.chatbot.travel.dto;

public class VerifyPaymentRequest {
    private Long bookingId;
    private String bookingRef;
    private Long userId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private String paymentMethod;

    public VerifyPaymentRequest() {
    }

    public VerifyPaymentRequest(Long bookingId, String bookingRef, Long userId,
                                String razorpayOrderId, String razorpayPaymentId,
                                String razorpaySignature, String paymentMethod) {
        this.bookingId = bookingId;
        this.bookingRef = bookingRef;
        this.userId = userId;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpaySignature = razorpaySignature;
        this.paymentMethod = paymentMethod;
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

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
