package com.chatbot.travel.util;

import com.chatbot.travel.model.Booking;
import com.chatbot.travel.model.Ticket;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Lightweight, zero-dependency PDF Ticket generator.
 * Produces compliant PDF-1.4 documents with professional styling and vector-drawn QR codes.
 */
public final class PdfTicketGenerator {

    private PdfTicketGenerator() {}

    public static byte[] generateTicketPdf(Ticket ticket, Booking booking) throws IOException {
        String placeName = ticket.getPlaceName() != null ? ticket.getPlaceName() :
                (booking.getPlace() != null ? booking.getPlace().getName() : "Heritage Monument");
        String bookingRef = booking.getBookingRef() != null ? booking.getBookingRef() : "BKG-" + booking.getBookingId();
        String ticketNumber = ticket.getTicketNumber() != null ? ticket.getTicketNumber() : "TKT-" + ticket.getTicketId();
        String visitDateStr = ticket.getVisitDate() != null ?
                ticket.getVisitDate().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")) : "N/A";

        int adults = booking.getAdultCount();
        int children = booking.getChildCount();
        double adultPrice = (booking.getPlace() != null && booking.getPlace().getAdultPrice() != null) ?
                booking.getPlace().getAdultPrice() : 0.0;
        double childPrice = (booking.getPlace() != null && booking.getPlace().getChildPrice() != null) ?
                booking.getPlace().getChildPrice() : 0.0;
        String totalAmountStr = booking.getTotalAmount() != null ?
                "INR " + booking.getTotalAmount().toPlainString() : "INR 0.00";
        String issuedAtStr = ticket.getIssuedAt() != null ?
                ticket.getIssuedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")) : "Recent";

        String qrPayload = ticket.getQrPayload() != null ? ticket.getQrPayload() : (bookingRef + ":" + ticketNumber);
        boolean[][] qrMatrix = QrCodeGenerator.encodeToMatrix(qrPayload);

        // Build PDF Content Stream
        StringBuilder cs = new StringBuilder();

        // 1. Background Fill (Soft Cool Gray #F8FAFC)
        cs.append("0.97 0.98 0.99 rg\n");
        cs.append("0 0 595.28 841.89 re f\n");

        // 2. Top Header Bar (Royal Blue #1E3A8A)
        cs.append("0.12 0.23 0.54 rg\n");
        cs.append("0 740 595.28 102 re f\n");

        // Top Accent Strip (Emerald Green #10B981)
        cs.append("0.06 0.72 0.51 rg\n");
        cs.append("0 735 595.28 5 re f\n");

        // Header Title Text
        cs.append("BT\n");
        cs.append("/F2 22 Tf\n");
        cs.append("1 1 1 rg\n"); // White
        cs.append("40 795 Td\n");
        cs.append("(ONLINE CHATBOT TICKETING SYSTEM) Tj\n");
        cs.append("ET\n");

        cs.append("BT\n");
        cs.append("/F1 12 Tf\n");
        cs.append("0.85 0.90 1.0 rg\n");
        cs.append("40 765 Td\n");
        cs.append("(Official Electronic Entry Pass  |  Verified & Confirmed) Tj\n");
        cs.append("ET\n");

        // 3. Main Ticket Card Container (White with rounded look, border)
        cs.append("1 1 1 rg\n");
        cs.append("40 180 515.28 520 re f\n");
        cs.append("0.85 0.88 0.92 RG\n"); // Border color
        cs.append("1 w\n");
        cs.append("40 180 515.28 520 re S\n");

        // Monument Name Banner inside Card
        cs.append("0.94 0.96 1.0 rg\n");
        cs.append("40 640 515.28 60 re f\n");

        cs.append("BT\n");
        cs.append("/F2 20 Tf\n");
        cs.append("0.09 0.17 0.35 rg\n");
        cs.append("60 662 Td\n");
        cs.append("(").append(escapePdfText(placeName.toUpperCase())).append(") Tj\n");
        cs.append("ET\n");

        // Key-Value Grid of Details
        drawKeyVal(cs, "VISIT DATE", visitDateStr, 60, 595, true);
        drawKeyVal(cs, "BOOKING REF", bookingRef, 300, 595, true);

        drawKeyVal(cs, "TICKET NUMBER", ticketNumber, 60, 540, true);
        drawKeyVal(cs, "ISSUED AT", issuedAtStr, 300, 540, false);

        // Divider Line
        cs.append("0.88 0.90 0.93 RG\n");
        cs.append("60 505 m 500 505 l S\n");

        // Visitor Breakdown Header
        cs.append("BT\n");
        cs.append("/F2 13 Tf\n");
        cs.append("0.15 0.20 0.30 rg\n");
        cs.append("60 480 Td\n");
        cs.append("(VISITOR DETAILS & TARIFF) Tj\n");
        cs.append("ET\n");

        // Visitor Rows
        String adultRow = adults + " Adult(s)  x  INR " + String.format("%.2f", adultPrice) +
                "  =  INR " + String.format("%.2f", adults * adultPrice);
        drawRowText(cs, adultRow, 60, 455);

        if (children > 0) {
            String childRow = children + " Child(ren)  x  INR " + String.format("%.2f", childPrice) +
                    "  =  INR " + String.format("%.2f", children * childPrice);
            drawRowText(cs, childRow, 60, 435);
        } else {
            drawRowText(cs, "0 Children", 60, 435);
        }

        // Total Amount Badge Box
        cs.append("0.92 0.97 0.94 rg\n");
        cs.append("60 380 200 36 re f\n");
        cs.append("0.06 0.72 0.51 RG\n");
        cs.append("1.5 w\n");
        cs.append("60 380 200 36 re S\n");

        cs.append("BT\n");
        cs.append("/F2 14 Tf\n");
        cs.append("0.04 0.45 0.30 rg\n");
        cs.append("75 392 Td\n");
        cs.append("(TOTAL PAID: ").append(escapePdfText(totalAmountStr)).append(") Tj\n");
        cs.append("ET\n");

        // Status Badge: PAID (Green)
        cs.append("0.06 0.72 0.51 rg\n");
        cs.append("420 655 75 25 re f\n");
        cs.append("BT\n");
        cs.append("/F2 11 Tf\n");
        cs.append("1 1 1 rg\n");
        cs.append("440 663 Td\n");
        cs.append("(PAID) Tj\n");
        cs.append("ET\n");

        // 4. Vector Render QR Code inside Card (Right side)
        int qrGridSize = qrMatrix.length;
        double qrBoxSize = 140.0;
        double qrX = 340.0;
        double qrY = 320.0;
        double cellSize = qrBoxSize / qrGridSize;

        // White backing box for QR
        cs.append("1 1 1 rg\n");
        cs.append((qrX - 10) + " " + (qrY - 10) + " " + (qrBoxSize + 20) + " " + (qrBoxSize + 20) + " re f\n");
        cs.append("0.85 0.88 0.92 RG\n");
        cs.append("1 w\n");
        cs.append((qrX - 10) + " " + (qrY - 10) + " " + (qrBoxSize + 20) + " " + (qrBoxSize + 20) + " re S\n");

        // Dark modules
        cs.append("0.09 0.17 0.35 rg\n");
        for (int r = 0; r < qrGridSize; r++) {
            for (int c = 0; c < qrGridSize; c++) {
                if (qrMatrix[r][c]) {
                    double cellX = qrX + c * cellSize;
                    double cellY = qrY + (qrGridSize - 1 - r) * cellSize;
                    cs.append(String.format(java.util.Locale.US, "%.2f %.2f %.2f %.2f re f\n", cellX, cellY, cellSize, cellSize));
                }
            }
        }

        // QR instructions text below QR
        cs.append("BT\n");
        cs.append("/F2 9 Tf\n");
        cs.append("0.35 0.40 0.50 rg\n");
        cs.append("355 295 Td\n");
        cs.append("(SCAN AT ENTRY GATE) Tj\n");
        cs.append("ET\n");

        // 5. Security & Entry Guidelines at bottom of Card
        cs.append("0.88 0.90 0.93 RG\n");
        cs.append("60 270 m 500 270 l S\n");

        cs.append("BT\n");
        cs.append("/F2 10 Tf\n");
        cs.append("0.15 0.20 0.30 rg\n");
        cs.append("60 248 Td\n");
        cs.append("(IMPORTANT VISITOR INSTRUCTIONS:) Tj\n");
        cs.append("ET\n");

        cs.append("BT\n");
        cs.append("/F1 9 Tf\n");
        cs.append("0.40 0.45 0.55 rg\n");
        cs.append("60 230 Td\n");
        cs.append("(* Present this digital or printed e-ticket along with an official government Photo ID.) Tj\n");
        cs.append("ET\n");

        cs.append("BT\n");
        cs.append("/F1 9 Tf\n");
        cs.append("0.40 0.45 0.55 rg\n");
        cs.append("60 215 Td\n");
        cs.append("(* Ticket is valid strictly for the date of visit during operational monument hours.) Tj\n");
        cs.append("ET\n");

        cs.append("BT\n");
        cs.append("/F1 9 Tf\n");
        cs.append("0.40 0.45 0.55 rg\n");
        cs.append("60 200 Td\n");
        cs.append("(* Non-transferable. Entry permitted only once per ticket pass.) Tj\n");
        cs.append("ET\n");

        // 6. Footer Note
        cs.append("BT\n");
        cs.append("/F1 9 Tf\n");
        cs.append("0.55 0.60 0.65 rg\n");
        cs.append("180 140 Td\n");
        cs.append("(Thank you for booking with Online Chatbot Ticketing System) Tj\n");
        cs.append("ET\n");

        return assemblePdf(cs.toString());
    }

    private static void drawKeyVal(StringBuilder cs, String label, String value, double x, double y, boolean boldValue) {
        cs.append("BT\n");
        cs.append("/F1 9 Tf\n");
        cs.append("0.50 0.55 0.65 rg\n");
        cs.append(x).append(" ").append(y + 14).append(" Td\n");
        cs.append("(").append(escapePdfText(label)).append(") Tj\n");
        cs.append("ET\n");

        cs.append("BT\n");
        cs.append(boldValue ? "/F2 13 Tf\n" : "/F1 12 Tf\n");
        cs.append("0.10 0.15 0.25 rg\n");
        cs.append(x).append(" ").append(y).append(" Td\n");
        cs.append("(").append(escapePdfText(value)).append(") Tj\n");
        cs.append("ET\n");
    }

    private static void drawRowText(StringBuilder cs, String text, double x, double y) {
        cs.append("BT\n");
        cs.append("/F1 11 Tf\n");
        cs.append("0.25 0.30 0.40 rg\n");
        cs.append(x).append(" ").append(y).append(" Td\n");
        cs.append("(").append(escapePdfText(text)).append(") Tj\n");
        cs.append("ET\n");
    }

    private static String escapePdfText(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("(", "\\(")
                .replace(")", "\\)");
    }

    private static byte[] assemblePdf(String contentStream) throws IOException {
        byte[] contentBytes = contentStream.getBytes(StandardCharsets.US_ASCII);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        List<Long> offsets = new ArrayList<>();

        out.write("%PDF-1.4\n".getBytes(StandardCharsets.US_ASCII));

        // 1 0 obj: Catalog
        offsets.add((long) out.size());
        out.write("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n".getBytes(StandardCharsets.US_ASCII));

        // 2 0 obj: Pages
        offsets.add((long) out.size());
        out.write("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n".getBytes(StandardCharsets.US_ASCII));

        // 3 0 obj: Page
        offsets.add((long) out.size());
        out.write(("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 6 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>\nendobj\n").getBytes(StandardCharsets.US_ASCII));

        // 4 0 obj: Font /F1 Helvetica
        offsets.add((long) out.size());
        out.write("4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n".getBytes(StandardCharsets.US_ASCII));

        // 5 0 obj: Font /F2 Helvetica-Bold
        offsets.add((long) out.size());
        out.write("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n".getBytes(StandardCharsets.US_ASCII));

        // 6 0 obj: Contents Stream
        offsets.add((long) out.size());
        out.write(("6 0 obj\n<< /Length " + contentBytes.length + " >>\nstream\n").getBytes(StandardCharsets.US_ASCII));
        out.write(contentBytes);
        out.write("\nendstream\nendobj\n".getBytes(StandardCharsets.US_ASCII));

        // Cross-reference table (xref)
        long xrefOffset = out.size();
        out.write("xref\n0 7\n0000000000 65535 f \n".getBytes(StandardCharsets.US_ASCII));
        for (Long off : offsets) {
            out.write(String.format(java.util.Locale.US, "%010d 00000 n \n", off).getBytes(StandardCharsets.US_ASCII));
        }

        // Trailer
        out.write(("trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF\n").getBytes(StandardCharsets.US_ASCII));

        return out.toByteArray();
    }
}
