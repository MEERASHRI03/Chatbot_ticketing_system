package com.chatbot.travel.util;

import com.chatbot.travel.model.Booking;
import com.chatbot.travel.model.Place;
import com.chatbot.travel.model.Ticket;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class TicketGeneratorTest {

    @Test
    void testQrCodeGeneration() throws Exception {
        byte[] png = QrCodeGenerator.generateQrPng("BKG-7A8B9C10:TKT-9D8E7F6A", 4);
        assertNotNull(png);
        assertTrue(png.length > 50);
        // PNG header signature: 0x89 'P' 'N' 'G'
        assertEquals((byte) 0x89, png[0]);
        assertEquals((byte) 'P', png[1]);
        assertEquals((byte) 'N', png[2]);
        assertEquals((byte) 'G', png[3]);
    }

    @Test
    void testPdfTicketGeneration() throws Exception {
        Place place = new Place();
        place.setName("Red Fort");
        place.setAdultPrice(35.0);
        place.setChildPrice(15.0);

        Booking booking = new Booking();
        booking.setBookingId(101L);
        booking.setBookingRef("BKG-TEST1234");
        booking.setPlace(place);
        booking.setVisitDate(LocalDate.of(2026, 11, 15));
        booking.setAdultCount(3);
        booking.setChildCount(2);
        booking.setTotalAmount(BigDecimal.valueOf(135.0));

        Ticket ticket = new Ticket();
        ticket.setTicketId(202L);
        ticket.setTicketNumber("TKT-TEST9876");
        ticket.setPlaceName("Red Fort");
        ticket.setVisitDate(LocalDate.of(2026, 11, 15));
        ticket.setAmount(BigDecimal.valueOf(135.0));
        ticket.setQrPayload("BKG-TEST1234:TKT-TEST9876");

        byte[] pdfBytes = PdfTicketGenerator.generateTicketPdf(ticket, booking);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 100);

        String pdfString = new String(pdfBytes, StandardCharsets.US_ASCII);
        assertTrue(pdfString.startsWith("%PDF-1.4"));
        assertTrue(pdfString.contains("%%EOF"));
        assertTrue(pdfString.contains("RED FORT"));
        assertTrue(pdfString.contains("BKG-TEST1234"));
        assertTrue(pdfString.contains("TKT-TEST9876"));
    }
}
