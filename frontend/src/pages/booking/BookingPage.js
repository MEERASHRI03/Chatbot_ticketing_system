import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { createBooking } from "../../services/bookingService";
import { getPlaceById } from "../../services/PlaceService";
import "../../styles/booking.css";

function BookingPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [loadingPlace, setLoadingPlace] = useState(true);

  // Today's date in YYYY-MM-DD for min date attribute
  const todayStr = new Date().toISOString().split("T")[0];

  const [visitDate, setVisitDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10AM-12PM");
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Ensure Razorpay SDK is loaded
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Fetch Place Details
  useEffect(() => {
    setLoadingPlace(true);
    getPlaceById(placeId)
      .then((res) => {
        setPlace(res.data);
      })
      .catch((err) => {
        console.error("Error fetching place:", err);
      })
      .finally(() => setLoadingPlace(false));
  }, [placeId]);

  const adultPrice = place?.adultPrice != null ? place.adultPrice : 50;
  const childPrice = place?.childPrice != null ? place.childPrice : 25;
  const totalAmount = adultCount * adultPrice + childCount * childPrice;

  const getEffectiveUserId = () => {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        userId = storedUser.userId;
      } catch {}
    }
    return userId ? Number(userId) : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = getEffectiveUserId();
    if (!userId) {
      alert("Please login first to book tickets.");
      navigate("/login");
      return;
    }

    if (!visitDate) {
      alert("Please select a valid visit date.");
      return;
    }

    if (adultCount <= 0) {
      alert("At least 1 adult visitor is required.");
      return;
    }

    if (adultCount + childCount > 10) {
      alert("Maximum 10 visitors allowed per booking.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Booking as PENDING
      const bookingData = {
        userId: userId,
        placeId: Number(placeId),
        visitDate,
        timeSlot,
        adultCount: Number(adultCount),
        childCount: Number(childCount),
        totalAmount,
        status: "PENDING",
      };

      const bookingRes = await createBooking(bookingData);
      const createdBooking = bookingRes.data;

      // 2. Create Razorpay Order
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const orderRes = await fetch("http://localhost:8080/api/payments/create-order", {
        method: "POST",
        headers,
        body: JSON.stringify({
          bookingId: createdBooking.bookingId,
          bookingRef: createdBooking.bookingRef,
          userId: userId,
          amount: totalAmount,
        }),
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        throw new Error(errText || "Failed to create payment order.");
      }

      const orderData = await orderRes.json();

      // 3. Open Razorpay Checkout Modal
      if (!window.Razorpay) {
        alert("Payment gateway loading, please try again.");
        setIsSubmitting(false);
        return;
      }

      const options = {
        key: orderData.key || "rzp_test_SUK0BZ6I8Jz44v",
        amount: orderData.amount,
        currency: "INR",
        name: "Online Chatbot Ticketing",
        description: `Pass for ${place?.name || "Monument"} (${createdBooking.bookingRef})`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // 4. Verify Payment Server-Side
          try {
            const verifyRes = await fetch("http://localhost:8080/api/payments/verify", {
              method: "POST",
              headers,
              body: JSON.stringify({
                bookingId: createdBooking.bookingId,
                bookingRef: createdBooking.bookingRef,
                userId: userId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentMethod: "RAZORPAY",
              }),
            });

            if (!verifyRes.ok) {
              const vErr = await verifyRes.json().catch(() => ({}));
              throw new Error(vErr.message || "Payment signature verification failed.");
            }

            const verifyData = await verifyRes.json();

            setBookingSuccess({
              bookingId: createdBooking.bookingId,
              bookingRef: createdBooking.bookingRef,
              ticketNumber: verifyData.ticketNumber,
              downloadUrl: `/api/tickets/${createdBooking.bookingRef}/download`,
              totalAmount,
            });
          } catch (err) {
            console.error("Verification error:", err);
            alert("Verification failed: " + err.message);
            navigate("/my-bookings");
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            alert("Payment dismissed. Your booking is saved as PENDING. You can pay anytime in My Bookings.");
            navigate("/my-bookings");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.response?.data?.message || error.message || "Failed to complete booking.");
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    { value: "10AM-12PM", label: "10:00 AM – 12:00 PM", icon: "🌅" },
    { value: "12PM-2PM", label: "12:00 PM – 2:00 PM", icon: "☀️" },
    { value: "2PM-4PM", label: "2:00 PM – 4:00 PM", icon: "🌤️" },
  ];

  if (loadingPlace) {
    return (
      <div className="bk-root" style={{ textAlign: "center", paddingTop: "100px" }}>
        <p>Loading monument details…</p>
      </div>
    );
  }

  // Success view once ticket is paid and generated
  if (bookingSuccess) {
    return (
      <div className="bk-root">
        <div className="bk-header" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "56px", marginBottom: "12px" }}>🎉</div>
          <span className="bk-tag" style={{ background: "#dcfce7", color: "#166534" }}>
            Payment Verified & Ticket Issued
          </span>
          <h1 className="bk-title">You're All Set!</h1>
          <p className="bk-sub">
            Your booking for <strong>{place?.name}</strong> has been confirmed.
          </p>

          <div
            style={{
              maxWidth: "520px",
              margin: "24px auto",
              background: "#fff",
              border: "1.5px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#64748b" }}>Booking Ref:</span>
              <strong>{bookingSuccess.bookingRef}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#64748b" }}>Ticket Number:</span>
              <strong style={{ color: "#0d9488" }}>#{bookingSuccess.ticketNumber}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ color: "#64748b" }}>Visit Date:</span>
              <strong>{visitDate} ({timeSlot})</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ color: "#64748b" }}>Total Paid:</span>
              <strong>₹{bookingSuccess.totalAmount}</strong>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => window.open(`http://localhost:8080/api/tickets/${bookingSuccess.bookingRef}/download`, "_blank")}
                style={{
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                📥 Download PDF Ticket Pass
              </button>

              <button
                onClick={() => navigate(`/ticket/${bookingSuccess.bookingId}`)}
                style={{
                  background: "#0f766e",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                View E-Ticket with QR Code →
              </button>

              <button
                onClick={() => navigate("/my-bookings")}
                style={{
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  padding: "10px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Go to My Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bk-root">
      {/* Blobs */}
      <div className="bk-blob bk-blob-1" />
      <div className="bk-blob bk-blob-2" />

      {/* Page header */}
      <div className="bk-header">
        <button className="bk-back" onClick={() => navigate(-1)}>← Back</button>
        <span className="bk-tag">Direct Form Booking</span>
        <h1 className="bk-title">Book Pass for {place?.name || "Monument"}</h1>
        <p className="bk-sub">
          📍 {place?.city}, {place?.state} · Capacity: {place?.dailyCapacity || 5000} visitors/day
        </p>
      </div>

      <div className="bk-layout">
        {/* ── Form ── */}
        <div className="bk-form-card">
          <form onSubmit={handleSubmit} className="bk-form">
            {/* Visit Date */}
            <div className="bk-field">
              <label className="bk-label">
                <span className="bk-label-icon">📅</span> Select Visit Date
              </label>
              <input
                className="bk-input"
                type="date"
                min={todayStr}
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
              />
            </div>

            {/* Time Slot */}
            <div className="bk-field">
              <label className="bk-label">
                <span className="bk-label-icon">🕐</span> Time Slot
              </label>
              <div className="bk-slot-grid">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    className={`bk-slot-btn ${timeSlot === slot.value ? "bk-slot-active" : ""}`}
                    onClick={() => setTimeSlot(slot.value)}
                  >
                    <span>{slot.icon}</span>
                    <span>{slot.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Guests */}
            <div className="bk-field">
              <label className="bk-label">
                <span className="bk-label-icon">👥</span> Visitors
              </label>
              <div className="bk-guests-row">
                <div className="bk-guest-box">
                  <div className="bk-guest-info">
                    <span className="bk-guest-icon">👨‍👩‍👧</span>
                    <div>
                      <div className="bk-guest-label">Adults</div>
                      <div className="bk-guest-price">₹{adultPrice} each</div>
                    </div>
                  </div>
                  <div className="bk-counter">
                    <button
                      type="button"
                      className="bk-counter-btn"
                      onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                    >
                      −
                    </button>
                    <span className="bk-counter-val">{adultCount}</span>
                    <button
                      type="button"
                      className="bk-counter-btn"
                      onClick={() => setAdultCount(Math.min(10, adultCount + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bk-guest-box">
                  <div className="bk-guest-info">
                    <span className="bk-guest-icon">🧒</span>
                    <div>
                      <div className="bk-guest-label">Children</div>
                      <div className="bk-guest-price">₹{childPrice} each</div>
                    </div>
                  </div>
                  <div className="bk-counter">
                    <button
                      type="button"
                      className="bk-counter-btn"
                      onClick={() => setChildCount(Math.max(0, childCount - 1))}
                    >
                      −
                    </button>
                    <span className="bk-counter-val">{childCount}</span>
                    <button
                      type="button"
                      className="bk-counter-btn"
                      onClick={() => setChildCount(Math.min(10, childCount + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="bk-submit-btn"
              disabled={isSubmitting}
              style={{
                background: "linear-gradient(135deg, #0d9488, #0f766e)",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Opening Payment…" : `Confirm & Pay ₹${totalAmount} via Razorpay →`}
            </button>

            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <Link
                to="/chatbot"
                style={{
                  fontSize: "13px",
                  color: "#4f46e5",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Prefer typing in English? Chat with our AI to book instead 💬
              </Link>
            </div>
          </form>
        </div>

        {/* ── Summary Sidebar ── */}
        <div className="bk-summary-card">
          <div className="bk-summary-header">Booking Summary</div>

          <div className="bk-summary-rows">
            <div className="bk-summary-row">
              <span>🏛️ Monument</span>
              <strong style={{ color: "#0f172a" }}>{place?.name || "Monument"}</strong>
            </div>
            <div className="bk-summary-row">
              <span>📅 Date</span>
              <span>{visitDate || "—"}</span>
            </div>
            <div className="bk-summary-row">
              <span>🕐 Slot</span>
              <span>{timeSlots.find((s) => s.value === timeSlot)?.label}</span>
            </div>
            <div className="bk-summary-row">
              <span>👨‍👩‍👧 Adults × {adultCount}</span>
              <span>₹{adultCount * adultPrice}</span>
            </div>
            <div className="bk-summary-row">
              <span>🧒 Children × {childCount}</span>
              <span>₹{childCount * childPrice}</span>
            </div>
          </div>

          <div className="bk-summary-divider" />

          <div className="bk-summary-total">
            <span>Total Payable</span>
            <span className="bk-total-amount">₹{totalAmount}</span>
          </div>

          <div className="bk-summary-note">
            💳 Official Razorpay Test Checkout (No real money deducted)
          </div>

          <div className="bk-summary-badge">
            <span className="bk-badge-dot" /> Instant PDF Ticket with QR Code upon payment
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
