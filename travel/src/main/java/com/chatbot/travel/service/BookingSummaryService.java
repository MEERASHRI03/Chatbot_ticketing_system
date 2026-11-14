package com.chatbot.travel.service;

import com.chatbot.travel.dto.BookingRequestDTO;
import com.chatbot.travel.dto.BookingSummaryDTO;
import com.chatbot.travel.model.Place;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class BookingSummaryService {

    public BookingSummaryDTO generateSummary(BookingRequestDTO request, Place place) {
        double adultPrice = place.getAdultPrice() != null ? place.getAdultPrice() : 0.0;
        double childPrice = place.getChildPrice() != null ? place.getChildPrice() : 0.0;

        // Treat senior count as adult price if present, or ignore if not specified.
        // We will default to treating seniors at adult price.
        double total = (request.getAdultCount() * adultPrice) + 
                       (request.getChildCount() * childPrice) +
                       (request.getSeniorCount() * adultPrice);

        BigDecimal totalAmount = BigDecimal.valueOf(total);

        return new BookingSummaryDTO(
                place,
                request.getVisitDate(),
                request.getTimeSlot(),
                request.getAdultCount(),
                request.getChildCount(),
                request.getSeniorCount(),
                totalAmount
        );
    }
}
