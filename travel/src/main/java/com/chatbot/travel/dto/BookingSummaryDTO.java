package com.chatbot.travel.dto;

import com.chatbot.travel.model.Place;
import java.math.BigDecimal;
import java.time.LocalDate;

public class BookingSummaryDTO {
    private Place selectedPlace;
    private LocalDate visitDate;
    private String timeSlot;
    private int adultCount;
    private int childCount;
    private int seniorCount;
    private BigDecimal totalAmount;

    public BookingSummaryDTO() {}

    public BookingSummaryDTO(Place selectedPlace, LocalDate visitDate, String timeSlot, int adultCount, int childCount, int seniorCount, BigDecimal totalAmount) {
        this.selectedPlace = selectedPlace;
        this.visitDate = visitDate;
        this.timeSlot = timeSlot;
        this.adultCount = adultCount;
        this.childCount = childCount;
        this.seniorCount = seniorCount;
        this.totalAmount = totalAmount;
    }

    public Place getSelectedPlace() {
        return selectedPlace;
    }

    public void setSelectedPlace(Place selectedPlace) {
        this.selectedPlace = selectedPlace;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public int getAdultCount() {
        return adultCount;
    }

    public void setAdultCount(int adultCount) {
        this.adultCount = adultCount;
    }

    public int getChildCount() {
        return childCount;
    }

    public void setChildCount(int childCount) {
        this.childCount = childCount;
    }

    public int getSeniorCount() {
        return seniorCount;
    }

    public void setSeniorCount(int seniorCount) {
        this.seniorCount = seniorCount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
