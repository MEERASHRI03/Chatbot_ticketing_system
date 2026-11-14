package com.chatbot.travel.dto;

import com.chatbot.travel.model.enums.ChatState;

import java.util.ArrayList;
import java.util.List;

public class ChatResponse {
    private String reply;
    private ChatState state;
    private BookingDraft bookingDraft;
    private List<String> actions = new ArrayList<>();

    public ChatResponse() {}

    public ChatResponse(String reply, ChatState state, BookingDraft bookingDraft, List<String> actions) {
        this.reply = reply;
        this.state = state;
        this.bookingDraft = bookingDraft;
        this.actions = actions != null ? actions : new ArrayList<>();
    }

    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }

    public ChatState getState() { return state; }
    public void setState(ChatState state) { this.state = state; }

    public BookingDraft getBookingDraft() { return bookingDraft; }
    public void setBookingDraft(BookingDraft bookingDraft) { this.bookingDraft = bookingDraft; }

    public List<String> getActions() { return actions; }
    public void setActions(List<String> actions) { this.actions = actions; }
}
