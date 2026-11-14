package com.chatbot.travel.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BookingDraft {
    private Long placeId;
    private String placeName;
    private LocalDate visitDate;
    private Integer adults;
    private Integer children = 0;
    private Integer totalMembers;
    private Double adultPrice;
    private Double childPrice;
    private BigDecimal totalAmount;

    private Long bookingId;
    private String bookingRef;
    private String razorpayOrderId;
    private String razorpayKeyId;
    private Integer amountInPaise;
    private String ticketNumber;
    private String downloadUrl;

    private List<String> missingFields = new ArrayList<>();
    private String validationError;

    public BookingDraft() {}

    public Long getPlaceId() { return placeId; }
    public void setPlaceId(Long placeId) { this.placeId = placeId; }

    public String getPlaceName() { return placeName; }
    public void setPlaceName(String placeName) { this.placeName = placeName; }

    public LocalDate getVisitDate() { return visitDate; }
    public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }

    public Integer getAdults() { return adults; }
    public void setAdults(Integer adults) { this.adults = adults; }

    public Integer getChildren() { return children != null ? children : 0; }
    public void setChildren(Integer children) { this.children = children; }

    public Integer getTotalMembers() { return totalMembers; }
    public void setTotalMembers(Integer totalMembers) { this.totalMembers = totalMembers; }

    public Double getAdultPrice() { return adultPrice; }
    public void setAdultPrice(Double adultPrice) { this.adultPrice = adultPrice; }

    public Double getChildPrice() { return childPrice; }
    public void setChildPrice(Double childPrice) { this.childPrice = childPrice; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getBookingRef() { return bookingRef; }
    public void setBookingRef(String bookingRef) { this.bookingRef = bookingRef; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayKeyId() { return razorpayKeyId; }
    public void setRazorpayKeyId(String razorpayKeyId) { this.razorpayKeyId = razorpayKeyId; }

    public Integer getAmountInPaise() { return amountInPaise; }
    public void setAmountInPaise(Integer amountInPaise) { this.amountInPaise = amountInPaise; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }

    public List<String> getMissingFields() { return missingFields; }
    public void setMissingFields(List<String> missingFields) { this.missingFields = missingFields; }

    public String getValidationError() { return validationError; }
    public void setValidationError(String validationError) { this.validationError = validationError; }

    public void calculateTotal() {
        if (adultPrice != null && adults != null) {
            double adTotal = adults * adultPrice;
            double chTotal = (children != null ? children : 0) * (childPrice != null ? childPrice : 0);
            this.totalAmount = BigDecimal.valueOf(adTotal + chTotal);
            if (this.totalAmount != null) {
                this.amountInPaise = this.totalAmount.multiply(BigDecimal.valueOf(100)).intValue();
            }
        }
    }
}
