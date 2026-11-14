package com.chatbot.travel.service;

import com.chatbot.travel.dto.BookingDraft;
import com.chatbot.travel.model.Place;
import com.chatbot.travel.model.enums.Region;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BookingIntentParserTest {

    private BookingIntentParser parser;
    private List<Place> samplePlaces;
    private final ZoneId zone = ZoneId.of("Asia/Kolkata");
    // Fix current time to 2026-11-14T12:00:00Z for deterministic tests
    private final LocalDate fixedToday = LocalDate.of(2026, 11, 14);

    @BeforeEach
    void setUp() {
        Clock fixedClock = Clock.fixed(
                fixedToday.atStartOfDay(zone).toInstant(),
                zone
        );
        parser = new BookingIntentParser(fixedClock);

        samplePlaces = new ArrayList<>();

        Place redFort = new Place();
        redFort.setPlaceId(1L);
        redFort.setName("Red Fort");
        redFort.setAliases("lal qila, red fort delhi, lal quila");
        redFort.setAdultPrice(35.0);
        redFort.setChildPrice(15.0);
        redFort.setAvailableSlots(1000);
        redFort.setDailyCapacity(1000);
        redFort.setActive(true);
        samplePlaces.add(redFort);

        Place tajMahal = new Place();
        tajMahal.setPlaceId(2L);
        tajMahal.setName("Taj Mahal");
        tajMahal.setAliases("taj, tajmahal, agra monument");
        tajMahal.setAdultPrice(50.0);
        tajMahal.setChildPrice(20.0);
        tajMahal.setAvailableSlots(1500);
        tajMahal.setDailyCapacity(1500);
        tajMahal.setActive(true);
        samplePlaces.add(tajMahal);

        Place qutubMinar = new Place();
        qutubMinar.setPlaceId(3L);
        qutubMinar.setName("Qutub Minar");
        qutubMinar.setAliases("qutb minar, qutab minar, victory tower");
        qutubMinar.setAdultPrice(35.0);
        qutubMinar.setChildPrice(15.0);
        qutubMinar.setAvailableSlots(800);
        qutubMinar.setDailyCapacity(800);
        qutubMinar.setActive(true);
        samplePlaces.add(qutubMinar);

        Place hawaMahal = new Place();
        hawaMahal.setPlaceId(4L);
        hawaMahal.setName("Hawa Mahal");
        hawaMahal.setAliases("palace of winds, hawa mahal jaipur");
        hawaMahal.setAdultPrice(50.0);
        hawaMahal.setChildPrice(20.0);
        hawaMahal.setAvailableSlots(600);
        hawaMahal.setDailyCapacity(600);
        hawaMahal.setActive(true);
        samplePlaces.add(hawaMahal);

        Place amberFort = new Place();
        amberFort.setPlaceId(5L);
        amberFort.setName("Amber Fort");
        amberFort.setAliases("amer fort, amber palace, jaipur fort");
        amberFort.setAdultPrice(100.0);
        amberFort.setChildPrice(50.0);
        amberFort.setAvailableSlots(800);
        amberFort.setDailyCapacity(800);
        amberFort.setActive(true);
        samplePlaces.add(amberFort);

        Place indiaGate = new Place();
        indiaGate.setPlaceId(6L);
        indiaGate.setName("India Gate");
        indiaGate.setAliases("all india war memorial, war memorial delhi");
        indiaGate.setAdultPrice(20.0);
        indiaGate.setChildPrice(10.0);
        indiaGate.setAvailableSlots(2000);
        indiaGate.setDailyCapacity(2000);
        indiaGate.setActive(true);
        samplePlaces.add(indiaGate);

        Place gateway = new Place();
        gateway.setPlaceId(7L);
        gateway.setName("Gateway of India");
        gateway.setAliases("gateway, gateway mumbai, landmark");
        gateway.setAdultPrice(30.0);
        gateway.setChildPrice(15.0);
        gateway.setAvailableSlots(1200);
        gateway.setDailyCapacity(1200);
        gateway.setActive(true);
        samplePlaces.add(gateway);

        Place mysorePalace = new Place();
        mysorePalace.setPlaceId(8L);
        mysorePalace.setName("Mysore Palace");
        mysorePalace.setAliases("mysuru palace, amba vilas palace");
        mysorePalace.setAdultPrice(70.0);
        mysorePalace.setChildPrice(30.0);
        mysorePalace.setAvailableSlots(1000);
        mysorePalace.setDailyCapacity(1000);
        mysorePalace.setActive(true);
        samplePlaces.add(mysorePalace);
    }

    // 1. Goal Example
    @Test
    void test1_ExampleSentence() {
        String msg = "book ticket to visit red fort for tomorrow of 5 members with 3 adults and 2 child";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNull(res.getValidationError());
        assertNotNull(res.getPlace());
        assertEquals("Red Fort", res.getPlace().getName());
        assertEquals(fixedToday.plusDays(1), res.getVisitDate());
        assertEquals(5, res.getTotalMembers());
        assertEquals(3, res.getAdults());
        assertEquals(2, res.getChildren());
        assertTrue(res.getMissingFields().isEmpty());
    }

    // 2. Today relative date with Taj Mahal
    @Test
    void test2_TodayWithTajMahal() {
        String msg = "visit taj mahal today for 2 adults";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNull(res.getValidationError());
        assertEquals("Taj Mahal", res.getPlace().getName());
        assertEquals(fixedToday, res.getVisitDate());
        assertEquals(2, res.getAdults());
        assertEquals(0, res.getChildren());
        assertEquals(2, res.getTotalMembers());
    }

    // 3. Day after tomorrow with kids
    @Test
    void test3_DayAfterTomorrowWithKids() {
        String msg = "book 4 tickets for red fort day after tomorrow 2 adults 2 kids";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNull(res.getValidationError());
        assertEquals("Red Fort", res.getPlace().getName());
        assertEquals(fixedToday.plusDays(2), res.getVisitDate());
        assertEquals(4, res.getTotalMembers());
        assertEquals(2, res.getAdults());
        assertEquals(2, res.getChildren());
    }

    // 4. Next friday
    @Test
    void test4_NextFriday() {
        String msg = "i want to visit qutub minar next friday for 1 adult";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNull(res.getValidationError());
        assertEquals("Qutub Minar", res.getPlace().getName());
        assertNotNull(res.getVisitDate());
        assertTrue(res.getVisitDate().isAfter(fixedToday));
        assertEquals(1, res.getAdults());
    }

    // 5. Month name date format (15 nov)
    @Test
    void test5_MonthNameDate() {
        String msg = "hawa mahal on 15 nov for 3 adults and 1 children";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNull(res.getValidationError());
        assertEquals("Hawa Mahal", res.getPlace().getName());
        assertEquals(LocalDate.of(2026, 11, 15), res.getVisitDate());
        assertEquals(3, res.getAdults());
        assertEquals(1, res.getChildren());
        assertEquals(4, res.getTotalMembers());
    }

    // 6. Explicit numeric date DD/MM/YYYY
    @Test
    void test6_ExplicitNumericDate() {
        String msg = "amber fort 15/11/2026 2 adults";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNull(res.getValidationError());
        assertEquals("Amber Fort", res.getPlace().getName());
        assertEquals(LocalDate.of(2026, 11, 15), res.getVisitDate());
        assertEquals(2, res.getAdults());
    }

    // 7. Partial message missing date and counts
    @Test
    void test7_PartialMissingDateAndCounts() {
        String msg = "visit red fort";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNull(res.getValidationError());
        assertEquals("Red Fort", res.getPlace().getName());
        assertNull(res.getVisitDate());
        assertNull(res.getAdults());
        assertTrue(res.getMissingFields().contains("visitDate"));
        assertTrue(res.getMissingFields().contains("adults"));
    }

    // 8. Partial message missing place
    @Test
    void test8_PartialMissingPlace() {
        String msg = "tomorrow for 2 adults";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNull(res.getValidationError());
        assertNull(res.getPlace());
        assertEquals(fixedToday.plusDays(1), res.getVisitDate());
        assertEquals(2, res.getAdults());
        assertTrue(res.getMissingFields().contains("place"));
    }

    // 9. Total members equals adults, deduce 0 children
    @Test
    void test9_TotalEqualsAdults() {
        String msg = "visit india gate tomorrow for 5 members with 5 adults";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNull(res.getValidationError());
        assertEquals("India Gate", res.getPlace().getName());
        assertEquals(5, res.getAdults());
        assertEquals(0, res.getChildren());
        assertEquals(5, res.getTotalMembers());
    }

    // 10. Gateway of India with singular child
    @Test
    void test10_GatewayWithChild() {
        String msg = "gateway of india today 1 adult and 3 child";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNull(res.getValidationError());
        assertEquals("Gateway of India", res.getPlace().getName());
        assertEquals(1, res.getAdults());
        assertEquals(3, res.getChildren());
        assertEquals(4, res.getTotalMembers());
    }

    // 11. Validation: total members does not match adults + children
    @Test
    void test11_ValidationMismatch() {
        String msg = "visit red fort tomorrow 3 adults and 3 children for 5 members";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNotNull(res.getValidationError());
        assertTrue(res.getValidationError().contains("does not match"));
    }

    // 12. Validation: zero adults
    @Test
    void test12_ValidationZeroAdults() {
        String msg = "mysore palace tomorrow 0 adults 2 children";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNotNull(res.getValidationError());
        assertTrue(res.getValidationError().contains("At least 1 adult"));
    }

    // 13. Validation: max 10 tickets
    @Test
    void test13_ValidationMaxTickets() {
        String msg = "red fort today for 12 adults";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNotNull(res.getValidationError());
        assertTrue(res.getValidationError().contains("Maximum 10 tickets"));
    }

    // 14. Validation: reject past dates
    @Test
    void test14_RejectPastDate() {
        String msg = "red fort yesterday for 2 adults";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNotNull(res.getValidationError());
        assertTrue(res.getValidationError().contains("past"));
    }

    // 15. Alias matching: "lal qila" matches Red Fort
    @Test
    void test15_AliasMatching() {
        String msg = "book lal qila for tomorrow 2 adults";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNull(res.getValidationError());
        assertNotNull(res.getPlace());
        assertEquals("Red Fort", res.getPlace().getName());
        assertEquals(fixedToday.plusDays(1), res.getVisitDate());
        assertEquals(2, res.getAdults());
    }

    // 16. Multi-word alias "red fort delhi" with word numbers
    @Test
    void test16_MultiWordAliasAndWordNumbers() {
        String msg = "book ticket for red fort delhi tomorrow with four people two adults and two kids";
        BookingIntentParser.ParseResult res = parser.parse(msg, samplePlaces);

        assertNull(res.getValidationError());
        assertEquals("Red Fort", res.getPlace().getName());
        assertEquals(2, res.getAdults());
        assertEquals(2, res.getChildren());
        assertEquals(4, res.getTotalMembers());
    }

    // 17. Incremental slot filling with existing draft
    @Test
    void test17_IncrementalSlotFilling() {
        // Step 1: User says only place
        BookingIntentParser.ParseResult step1 = parser.parse("red fort", samplePlaces);
        assertEquals("Red Fort", step1.getPlace().getName());
        assertTrue(step1.getMissingFields().contains("visitDate"));

        BookingDraft draft = new BookingDraft();
        draft.setPlaceId(step1.getPlace().getPlaceId());
        draft.setPlaceName(step1.getPlace().getName());

        // Step 2: User provides date
        BookingIntentParser.ParseResult step2 = parser.parse("tomorrow", samplePlaces, draft);
        assertEquals("Red Fort", step2.getPlace().getName());
        assertEquals(fixedToday.plusDays(1), step2.getVisitDate());
        assertTrue(step2.getMissingFields().contains("adults"));

        draft.setVisitDate(step2.getVisitDate());

        // Step 3: User provides counts
        BookingIntentParser.ParseResult step3 = parser.parse("3 adults and 1 kid", samplePlaces, draft);
        assertEquals("Red Fort", step3.getPlace().getName());
        assertEquals(fixedToday.plusDays(1), step3.getVisitDate());
        assertEquals(3, step3.getAdults());
        assertEquals(1, step3.getChildren());
        assertTrue(step3.getMissingFields().isEmpty());
    }
}
