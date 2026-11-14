# Online Chatbot Ticketing System

An intelligent, natural-language monument ticketing platform. Users can chat with an automated assistant in plain English to discover monuments, parse dates and visitor counts, validate booking constraints, pay securely via Razorpay, and receive an authentic downloadable PDF e-ticket with a scannable QR code.

---

## Architecture & Tech Stack

- **Backend**: Spring Boot 3.2.8 (Java 17), Spring Data JPA, Spring Security, Razorpay Java SDK 1.4.7
- **Frontend**: React 18, React Router v6, CSS3 Animations, Razorpay Checkout Modal
- **Database**: MySQL (Hibernate DDL auto-update), automatic sample monument seeder
- **Ticket Generation**: Pure-Java zero-dependency PDF-1.4 generator & vector QR code encoder

---

## Environment Variables

Configure your credentials via system environment variables or in an `.env` file. **Never commit secrets to source control.**

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `RAZORPAY_KEY_ID` | Yes (or fallback prop) | Your Razorpay test Key ID | `rzp_test_SUK0BZ6I8Jz44v` |
| `RAZORPAY_KEY_SECRET` | Yes (or fallback prop) | Your Razorpay test Key Secret | `qeOpayI3p1YE2lOum3OShJua` |
| `RAZORPAY_WEBHOOK_SECRET` | Optional | Secret used to verify backup webhook signatures | `whsec_sample123` |
| `SPRING_DATASOURCE_URL` | Optional | MySQL connection URL (defaults to localhost:3306/travel) | `jdbc:mysql://localhost:3306/travel` |
| `SPRING_DATASOURCE_USERNAME` | Optional | Database user (defaults to `root`) | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Optional | Database password | `password` |

---

## Setup & Running

### 1. Backend (Spring Boot)

```bash
cd travel
# Build & run tests
./mvnw clean test -o

# Start application
./mvnw spring-boot:run
```
The backend starts on port **8080** (`http://localhost:8080`).

### 2. Frontend (React)

```bash
cd frontend
# Install dependencies
npm install

# Start local development server
npm start
```
The frontend starts on port **3000** (`http://localhost:3000`).

---

## Testing with Razorpay Test Cards

When the chatbot transitions to `AWAITING_PAYMENT`, click the **Pay Now** button. The Razorpay checkout modal opens. Use any of the following official Razorpay test credentials:

### 1. Successful Payment Flow
- **Card Number**: `4111 1111 1111 1111` or `4012 0000 0000 0002`
- **Expiry Date**: Any future month & year (e.g., `12/28`)
- **CVV**: `123`
- **Cardholder Name**: Any name (e.g., `John Doe`)
- **OTP Screen**: Click **Success** or enter OTP `123456`
- **Result**: Server verifies the HMAC SHA256 signature server-side, updates the booking to `PAID`, generates the PDF e-ticket with QR code, and presents the **Download Ticket** button.

### 2. Payment Failure Flow
- In the OTP screen, click **Failure**.
- **Result**: Bot displays: `❌ Payment failed: [reason]. You can click 'Pay now' to try again or reply 'cancel' to abort.`

### 3. User Dismissed Checkout
- Click the close **✕** button on the top right of the Razorpay modal without completing payment.
- **Result**: Bot displays: `⚠️ Checkout was cancelled before payment was completed. You can click 'Pay now' whenever you're ready, or 'Cancel' to abort.`

---

## Sample Chat Flow

### Scenario A: Complete Single-Sentence Booking
```text
User: "book ticket to visit red fort for tomorrow of 5 members with 3 adults and 2 child"

Bot: Please confirm your booking details:
     🏛️ Monument: Red Fort
     📅 Date: 15/11/2026
     👥 Adults: 3 x ₹35 = ₹105
     👶 Children: 2 x ₹15 = ₹30
     💰 Total Amount: ₹135

     Would you like to confirm this booking? Please reply 'yes' or 'confirm' to proceed, or 'cancel' to start over.
     [Quick Buttons: "✅ Confirm Booking", "✕ Cancel"]

User: "confirm" (or clicks "Confirm Booking")

Bot: Booking created with reference BKG-8F2B1C9D!
     Total amount to pay: INR 135.
     Please click the Pay now button below to complete payment via Razorpay.
     [Quick Buttons: "💳 Pay Now (₹135)", "✕ Cancel"]

User: (Clicks "Pay Now" and completes test payment)

Bot: 🎉 Payment successful! Payment ID: pay_PXYZ1234567890
     Your ticket #TKT-4A5B6C7D is confirmed!
     Click below to download your official PDF ticket.
     [Quick Button: "📥 Download Ticket (PDF)"]
```

### Scenario B: Incremental Slot Filling & Clarifications
```text
User: "visit taj mahal"
Bot:  "What date would you like to visit Taj Mahal? (e.g., today, tomorrow, or a specific date like 15/11/2026)"

User: "next friday"
Bot:  "How many adults will be visiting? (At least 1 adult is required per booking)"

User: "2 adults and 1 kid"
Bot:  (Shows confirmation summary with pricing and asks for confirmation)
```

### Scenario C: Constraint Validation
- **Past Date**: User says "red fort yesterday" → Bot replies: `⚠️ Date cannot be in the past. Please select today or a future date.`
- **Zero Adults**: User says "3 children" → Bot replies: `⚠️ At least 1 adult is required per booking.`
- **Max Limit**: User says "12 adults" → Bot replies: `⚠️ Maximum 10 tickets are allowed per booking.`
- **Mismatch**: User says "5 members with 3 adults and 3 kids" → Bot replies: `⚠️ Total members (5) does not match adults (3) + children (3).`

---

## API Endpoints Reference

### Chat & Intent Parser
- `POST /api/chat`
  - Body: `{ "sessionId": "string", "message": "string" }`
  - Response: `{ "reply": "string", "state": "IDLE|COLLECTING|CONFIRMING|AWAITING_PAYMENT|COMPLETED", "bookingDraft": { ... }, "actions": ["confirm", "cancel"] }`

### Payments
- `POST /api/payments/create-order`
  - Body: `{ "bookingRef": "string", "amount": 135 }`
  - Response: `{ "key": "rzp_test_...", "orderId": "order_...", "amount": 13500, "currency": "INR", "bookingRef": "..." }`
- `POST /api/payments/verify`
  - Body: `{ "bookingRef": "...", "razorpayOrderId": "...", "razorpayPaymentId": "...", "razorpaySignature": "..." }`
  - Response: `{ "success": true, "ticketNumber": "TKT-...", "downloadUrl": "/api/tickets/{bookingRef}/download" }`
- `POST /api/payments/webhook`
  - Backup webhook for `payment.captured` & `payment.failed` with cryptographic signature verification and idempotency.

### Tickets & User History
- `GET /api/tickets/{bookingRef}/download`
  - Returns: `Content-Type: application/pdf` with the formatted e-ticket containing vector QR code.
- `GET /api/tickets/user/{userId}`
  - Returns: List of active and past verified tickets for the user.
- `GET /api/bookings/user/{userId}`
  - Returns: All user bookings (including those booked via AI Chatbot and direct form).

---

## Dual Booking Channels & Web Dashboard

### 1. AI Chatbot Booking (Conversational Flow)
Users can chat with the assistant on `/chatbot` or via the floating widget. Bookings created through the chatbot are automatically tied to the logged-in user account and immediately reflected across:
- **Web Dashboard (`/home`)**: Visible under "My Bookings & Passes" with direct ticket viewing and 1-click PDF download.
- **My Bookings (`/my-bookings`)**: Listed under Confirmed/Paid or Pending tabs.
- **My Tickets (`/ticket`)**: Instant e-ticket pass with entry QR code and PDF download.

### 2. General Form-Based Booking
Users can also browse monuments on `/places` or `/home` and click **"Book Now →"** to access the traditional form-based booking on `/booking/:placeId`:
- Dynamic monument information, real-time ticket price calculation (Adults & Children), and capacity awareness.
- Direct Razorpay payment checkout with test credentials.
- Instant ticket confirmation and PDF download upon payment verification.
