package com.chatbot.travel.dto;

public class CancelTicketRequest {

    private String reason;

    public CancelTicketRequest() {}

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
