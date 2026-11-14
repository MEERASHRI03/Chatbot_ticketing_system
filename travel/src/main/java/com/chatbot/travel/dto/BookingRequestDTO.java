package com.chatbot.travel.dto;

import java.time.LocalDate;

public class BookingRequestDTO {
    private Long placeId;
    private LocalDate visitDate;
    private String timeSlot;
    private int adultCount;
    private int childCount;
    private int seniorCount;

    public BookingRequestDTO() {}

    public BookingRequestDTO(Long placeId, LocalDate visitDate, String timeSlot, int adultCount, int childCount, int seniorCount) {
        this.placeId = placeId;
        this.visitDate = visitDate;
        this.timeSlot = timeSlot;
        this.adultCount = adultCount;
        this.childCount = childCount;
        this.seniorCount = seniorCount;
    }

    public Long getPlaceId() {
        return placeId;
    }

    public void setPlaceId(Long placeId) {
        this.placeId = placeId;
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
}
