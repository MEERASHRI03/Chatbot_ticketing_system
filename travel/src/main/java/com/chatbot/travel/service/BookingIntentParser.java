package com.chatbot.travel.service;

import com.chatbot.travel.dto.BookingDraft;
import com.chatbot.travel.model.Place;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class BookingIntentParser {

    public static final ZoneId KOLKATA_ZONE = ZoneId.of("Asia/Kolkata");

    private final Clock clock;

    public BookingIntentParser() {
        this(Clock.system(KOLKATA_ZONE));
    }

    public BookingIntentParser(Clock clock) {
        this.clock = clock;
    }

    public static class ParseResult {
        private Place place;
        private LocalDate visitDate;
        private Integer totalMembers;
        private Integer adults;
        private Integer children;
        private String validationError;
        private final List<String> missingFields = new ArrayList<>();

        public Place getPlace() { return place; }
        public void setPlace(Place place) { this.place = place; }

        public LocalDate getVisitDate() { return visitDate; }
        public void setVisitDate(LocalDate visitDate) { this.visitDate = visitDate; }

        public Integer getTotalMembers() { return totalMembers; }
        public void setTotalMembers(Integer totalMembers) { this.totalMembers = totalMembers; }

        public Integer getAdults() { return adults; }
        public void setAdults(Integer adults) { this.adults = adults; }

        public Integer getChildren() { return children; }
        public void setChildren(Integer children) { this.children = children; }

        public String getValidationError() { return validationError; }
        public void setValidationError(String validationError) { this.validationError = validationError; }

        public List<String> getMissingFields() { return missingFields; }
    }

    public ParseResult parse(String message, List<Place> candidatePlaces) {
        return parse(message, candidatePlaces, null);
    }

    public ParseResult parse(String message, List<Place> candidatePlaces, BookingDraft existingDraft) {
        ParseResult result = new ParseResult();
        if (message == null || message.trim().isEmpty()) {
            result.setValidationError("Message cannot be empty.");
            return result;
        }

        String rawText = message.trim();
        String lowerText = rawText.toLowerCase();

        // 1. Extract Place
        Place matchedPlace = extractPlace(lowerText, candidatePlaces);
        if (matchedPlace == null && existingDraft != null && existingDraft.getPlaceId() != null) {
            // retain from existing draft
            if (candidatePlaces != null) {
                for (Place p : candidatePlaces) {
                    if (p.getPlaceId() != null && p.getPlaceId().equals(existingDraft.getPlaceId())) {
                        matchedPlace = p;
                        break;
                    }
                }
            }
        }
        result.setPlace(matchedPlace);

        // 2. Extract Date
        DateExtractResult dateExtract = extractDate(lowerText);
        if (dateExtract.pastDateError != null) {
            result.setValidationError(dateExtract.pastDateError);
            return result;
        }

        LocalDate visitDate = dateExtract.date;
        if (visitDate == null && existingDraft != null && existingDraft.getVisitDate() != null) {
            visitDate = existingDraft.getVisitDate();
        }
        result.setVisitDate(visitDate);

        // 3. Extract Counts
        Integer adults = extractCount(lowerText, "(?:(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)\\s*(?:adults?|grown\\s*ups?))");
        Integer children = extractCount(lowerText, "(?:(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)\\s*(?:child(?:ren)?|kids?))");
        Integer total = extractCount(lowerText, "(?:(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)\\s*(?:members?|people|persons?|tickets?|seats?|visitors?))");

        // Single number handling when specific questions were asked
        if (adults == null && children == null && total == null) {
            Pattern singleNumPattern = Pattern.compile("^\\s*(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)\\s*$");
            Matcher sm = singleNumPattern.matcher(lowerText);
            if (sm.find()) {
                int num = parseNumberWord(sm.group(1));
                if (existingDraft != null && existingDraft.getAdults() == null) {
                    adults = num;
                } else if (existingDraft != null && existingDraft.getAdults() != null && existingDraft.getChildren() == null) {
                    children = num;
                } else {
                    total = num;
                }
            }
        }

        // Merge with existing draft if not present in current message
        if (adults == null && existingDraft != null && existingDraft.getAdults() != null) {
            adults = existingDraft.getAdults();
        }
        if (children == null && existingDraft != null && existingDraft.getChildren() != null) {
            children = existingDraft.getChildren();
        }
        if (total == null && existingDraft != null && existingDraft.getTotalMembers() != null) {
            total = existingDraft.getTotalMembers();
        }

        // Auto-deduce or reconcile counts
        if (total != null) {
            if (adults != null && children != null) {
                if (adults + children != total) {
                    result.setValidationError("Total members (" + total + ") does not match adults (" + adults + ") + children (" + children + ").");
                    return result;
                }
            } else if (adults != null) {
                children = total - adults;
                if (children < 0) {
                    result.setValidationError("Adults count (" + adults + ") exceeds total members (" + total + ").");
                    return result;
                }
            } else if (children != null) {
                adults = total - children;
            }
        }

        // Default children to 0 if adults are specified and no mention of children or total
        if (adults != null && children == null && total == null) {
            // Check if user specifically said just "X adults" or "X tickets"
            children = 0;
        }

        if (total == null && adults != null && children != null) {
            total = adults + children;
        }

        result.setAdults(adults);
        result.setChildren(children);
        result.setTotalMembers(total);

        // Validation Rules
        if (adults != null && adults < 1) {
            result.setValidationError("At least 1 adult is required per booking.");
            return result;
        }

        if (adults != null && children != null && (adults + children > 10)) {
            result.setValidationError("Maximum 10 tickets are allowed per booking.");
            return result;
        }

        if (total != null && total > 10) {
            result.setValidationError("Maximum 10 tickets are allowed per booking.");
            return result;
        }

        // Missing fields tracking
        if (result.getPlace() == null) {
            result.getMissingFields().add("place");
        }
        if (result.getVisitDate() == null) {
            result.getMissingFields().add("visitDate");
        }
        if (result.getAdults() == null) {
            result.getMissingFields().add("adults");
        }

        return result;
    }

    // ================= PLACE EXTRACTION =================

    private Place extractPlace(String text, List<Place> candidatePlaces) {
        if (candidatePlaces == null || candidatePlaces.isEmpty()) {
            return null;
        }

        String normalizedText = normalizeForMatching(text);
        Place bestPlace = null;
        double bestScore = 0.0;

        for (Place place : candidatePlaces) {
            if (place.getActive() != null && !place.getActive()) {
                continue;
            }

            // Check exact name substring match
            String placeNameNorm = normalizeForMatching(place.getName());
            if (normalizedText.contains(placeNameNorm)) {
                return place; // Direct exact match
            }

            // Check aliases substring match
            if (place.getAliases() != null) {
                String[] aliasArr = place.getAliases().split("[,;]");
                for (String alias : aliasArr) {
                    String aliasNorm = normalizeForMatching(alias);
                    if (!aliasNorm.isEmpty() && normalizedText.contains(aliasNorm)) {
                        return place;
                    }
                }
            }

            // Fuzzy similarity
            double score = computeSimilarity(normalizedText, placeNameNorm);
            if (place.getAliases() != null) {
                String[] aliasArr = place.getAliases().split("[,;]");
                for (String alias : aliasArr) {
                    double aliasScore = computeSimilarity(normalizedText, normalizeForMatching(alias));
                    if (aliasScore > score) {
                        score = aliasScore;
                    }
                }
            }

            if (score > bestScore && score >= 0.70) {
                bestScore = score;
                bestPlace = place;
            }
        }

        return bestPlace;
    }

    private String normalizeForMatching(String s) {
        if (s == null) return "";
        return s.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
    }

    private static final Set<String> STOP_WORDS = Set.of(
            "for", "to", "at", "in", "on", "of", "and", "with", "the", "a", "an",
            "book", "ticket", "tickets", "visit", "go", "i", "we", "want", "please", "tomorrow", "today", "yesterday"
    );

    private double computeSimilarity(String sentence, String target) {
        if (sentence == null || target == null || target.isEmpty()) return 0.0;
        if (sentence.contains(target)) return 1.0;

        String[] targetWords = Arrays.stream(target.split("\\s+"))
                .filter(w -> !STOP_WORDS.contains(w) && w.length() >= 3)
                .toArray(String[]::new);

        if (targetWords.length == 0) {
            return 0.0;
        }

        String[] sentenceWords = Arrays.stream(sentence.split("\\s+"))
                .filter(w -> !STOP_WORDS.contains(w) && w.length() >= 3)
                .toArray(String[]::new);

        if (sentenceWords.length == 0) {
            return 0.0;
        }

        double totalWordScore = 0.0;
        for (String tw : targetWords) {
            double bestTwScore = 0.0;
            for (String sw : sentenceWords) {
                if (sw.equals(tw)) {
                    bestTwScore = 1.0;
                    break;
                }
                int maxLen = Math.max(sw.length(), tw.length());
                if (maxLen >= 4) {
                    double sim = 1.0 - ((double) levenshteinDistance(sw, tw) / maxLen);
                    if (sim > bestTwScore) {
                        bestTwScore = sim;
                    }
                }
            }
            totalWordScore += bestTwScore;
        }

        return totalWordScore / targetWords.length;
    }

    private int levenshteinDistance(String s1, String s2) {
        int[] costs = new int[s2.length() + 1];
        for (int j = 0; j <= s2.length(); j++) costs[j] = j;
        for (int i = 1; i <= s1.length(); i++) {
            costs[0] = i;
            int nw = i - 1;
            for (int j = 1; j <= s2.length(); j++) {
                int cj = Math.min(1 + Math.min(costs[j], costs[j - 1]),
                        s1.charAt(i - 1) == s2.charAt(j - 1) ? nw : nw + 1);
                nw = costs[j];
                costs[j] = cj;
            }
        }
        return costs[s2.length()];
    }

    // ================= DATE EXTRACTION =================

    private static class DateExtractResult {
        LocalDate date;
        String pastDateError;
    }

    private DateExtractResult extractDate(String text) {
        DateExtractResult res = new DateExtractResult();
        LocalDate today = LocalDate.now(clock);

        // Check relative dates
        if (Pattern.compile("\\bday\\s+after\\s+tomorrow\\b").matcher(text).find()) {
            res.date = today.plusDays(2);
            return res;
        }
        if (Pattern.compile("\\btomorrow\\b").matcher(text).find()) {
            res.date = today.plusDays(1);
            return res;
        }
        if (Pattern.compile("\\btoday\\b").matcher(text).find()) {
            res.date = today;
            return res;
        }

        // Check "yesterday" or past terms
        if (Pattern.compile("\\byesterday\\b").matcher(text).find()) {
            res.pastDateError = "Date cannot be in the past. Please select today or a future date.";
            return res;
        }

        // Check "next <day_of_week>"
        Matcher nextDayMatcher = Pattern.compile("\\bnext\\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\\b").matcher(text);
        if (nextDayMatcher.find()) {
            DayOfWeek dow = parseDayOfWeek(nextDayMatcher.group(1));
            res.date = today.with(TemporalAdjusters.next(dow));
            return res;
        }

        // Check "this <day_of_week>" or "on <day_of_week>"
        Matcher dowMatcher = Pattern.compile("\\b(?:on\\s+|this\\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\\b").matcher(text);
        if (dowMatcher.find()) {
            DayOfWeek dow = parseDayOfWeek(dowMatcher.group(1));
            LocalDate nextDow = today.with(TemporalAdjusters.nextOrSame(dow));
            if (nextDow.equals(today)) {
                // If today is that day, user meant today or next week? Today is valid!
                res.date = today;
            } else {
                res.date = nextDow;
            }
            return res;
        }

        // Check numeric date DD/MM/YYYY or DD-MM-YYYY
        Matcher dmyMatcher = Pattern.compile("\\b(\\d{1,2})[/.-](\\d{1,2})[/.-](\\d{4})\\b").matcher(text);
        if (dmyMatcher.find()) {
            int d = Integer.parseInt(dmyMatcher.group(1));
            int m = Integer.parseInt(dmyMatcher.group(2));
            int y = Integer.parseInt(dmyMatcher.group(3));
            try {
                LocalDate parsed = LocalDate.of(y, m, d);
                if (parsed.isBefore(today)) {
                    res.pastDateError = "Date cannot be in the past (" + parsed + "). Please select today or a future date.";
                } else {
                    res.date = parsed;
                }
                return res;
            } catch (Exception ignored) {}
        }

        // Check numeric date YYYY-MM-DD
        Matcher ymdMatcher = Pattern.compile("\\b(\\d{4})[/.-](\\d{1,2})[/.-](\\d{1,2})\\b").matcher(text);
        if (ymdMatcher.find()) {
            int y = Integer.parseInt(ymdMatcher.group(1));
            int m = Integer.parseInt(ymdMatcher.group(2));
            int d = Integer.parseInt(ymdMatcher.group(3));
            try {
                LocalDate parsed = LocalDate.of(y, m, d);
                if (parsed.isBefore(today)) {
                    res.pastDateError = "Date cannot be in the past (" + parsed + "). Please select today or a future date.";
                } else {
                    res.date = parsed;
                }
                return res;
            } catch (Exception ignored) {}
        }

        // Check Month Name formats: e.g., "15 nov", "15th november", "nov 15"
        Matcher dayMonthMatcher = Pattern.compile("\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\\s+(\\d{4}))?\\b").matcher(text);
        if (dayMonthMatcher.find()) {
            int d = Integer.parseInt(dayMonthMatcher.group(1));
            int m = parseMonth(dayMonthMatcher.group(2));
            int y = dayMonthMatcher.group(3) != null ? Integer.parseInt(dayMonthMatcher.group(3)) : today.getYear();
            try {
                LocalDate parsed = LocalDate.of(y, m, d);
                if (dayMonthMatcher.group(3) == null && parsed.isBefore(today)) {
                    parsed = parsed.plusYears(1);
                }
                if (parsed.isBefore(today)) {
                    res.pastDateError = "Date cannot be in the past. Please select today or a future date.";
                } else {
                    res.date = parsed;
                }
                return res;
            } catch (Exception ignored) {}
        }

        Matcher monthDayMatcher = Pattern.compile("\\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(\\d{4}))?\\b").matcher(text);
        if (monthDayMatcher.find()) {
            int m = parseMonth(monthDayMatcher.group(1));
            int d = Integer.parseInt(monthDayMatcher.group(2));
            int y = monthDayMatcher.group(3) != null ? Integer.parseInt(monthDayMatcher.group(3)) : today.getYear();
            try {
                LocalDate parsed = LocalDate.of(y, m, d);
                if (monthDayMatcher.group(3) == null && parsed.isBefore(today)) {
                    parsed = parsed.plusYears(1);
                }
                if (parsed.isBefore(today)) {
                    res.pastDateError = "Date cannot be in the past. Please select today or a future date.";
                } else {
                    res.date = parsed;
                }
                return res;
            } catch (Exception ignored) {}
        }

        return res;
    }

    private DayOfWeek parseDayOfWeek(String dow) {
        switch (dow.toLowerCase()) {
            case "monday": return DayOfWeek.MONDAY;
            case "tuesday": return DayOfWeek.TUESDAY;
            case "wednesday": return DayOfWeek.WEDNESDAY;
            case "thursday": return DayOfWeek.THURSDAY;
            case "friday": return DayOfWeek.FRIDAY;
            case "saturday": return DayOfWeek.SATURDAY;
            case "sunday": return DayOfWeek.SUNDAY;
            default: return DayOfWeek.MONDAY;
        }
    }

    private int parseMonth(String monthStr) {
        String m = monthStr.toLowerCase();
        if (m.startsWith("jan")) return 1;
        if (m.startsWith("feb")) return 2;
        if (m.startsWith("mar")) return 3;
        if (m.startsWith("apr")) return 4;
        if (m.startsWith("may")) return 5;
        if (m.startsWith("jun")) return 6;
        if (m.startsWith("jul")) return 7;
        if (m.startsWith("aug")) return 8;
        if (m.startsWith("sep")) return 9;
        if (m.startsWith("oct")) return 10;
        if (m.startsWith("nov")) return 11;
        if (m.startsWith("dec")) return 12;
        return 1;
    }

    // ================= COUNTS EXTRACTION =================

    private Integer extractCount(String text, String regex) {
        Matcher m = Pattern.compile(regex).matcher(text);
        if (m.find()) {
            return parseNumberWord(m.group(1));
        }
        return null;
    }

    private int parseNumberWord(String word) {
        if (word == null) return 0;
        word = word.trim().toLowerCase();
        try {
            return Integer.parseInt(word);
        } catch (NumberFormatException ignored) {}

        switch (word) {
            case "one": return 1;
            case "two": return 2;
            case "three": return 3;
            case "four": return 4;
            case "five": return 5;
            case "six": return 6;
            case "seven": return 7;
            case "eight": return 8;
            case "nine": return 9;
            case "ten": return 10;
            default: return 0;
        }
    }
}
