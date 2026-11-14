package com.chatbot.travel.dto;

import java.util.List;

public class ExtractedIntent {
    private String placeName;
    private String date;
    private String timeSlot;
    private Integer adultCount;
    private Integer childCount;
    private Integer seniorCount;
    private String confidence;
    private List<String> missingFields;

    public ExtractedIntent() {}

    public String getPlaceName() {
        return placeName;
    }

    public void setPlaceName(String placeName) {
        this.placeName = placeName;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public Integer getAdultCount() {
        return adultCount;
    }

    public void setAdultCount(Integer adultCount) {
        this.adultCount = adultCount;
    }

    public Integer getChildCount() {
        return childCount;
    }

    public void setChildCount(Integer childCount) {
        this.childCount = childCount;
    }

    public Integer getSeniorCount() {
        return seniorCount;
    }

    public void setSeniorCount(Integer seniorCount) {
        this.seniorCount = seniorCount;
    }

    public String getConfidence() {
        return confidence;
    }

    public void setConfidence(String confidence) {
        this.confidence = confidence;
    }

    public List<String> getMissingFields() {
        return missingFields;
    }

    public void setMissingFields(List<String> missingFields) {
        this.missingFields = missingFields;
    }

    @Override
    public String toString() {
        return "ExtractedIntent{" +
                "placeName='" + placeName + '\'' +
                ", date='" + date + '\'' +
                ", timeSlot='" + timeSlot + '\'' +
                ", adultCount=" + adultCount +
                ", childCount=" + childCount +
                ", seniorCount=" + seniorCount +
                ", confidence='" + confidence + '\'' +
                ", missingFields=" + missingFields +
                '}';
    }
}
