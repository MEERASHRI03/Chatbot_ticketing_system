import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createBooking } from "../../services/bookingService";
import "../../styles/booking.css";

function BookingPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();

  const [visitDate, setVisitDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10AM-12PM");
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);

  const adultPrice = 500;
  const childPrice = 250;

  const totalAmount = adultCount * adultPrice + childCount * childPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    const bookingData = {
      userId: user.userId,
      placeId: Number(placeId),
      visitDate,
      timeSlot,
      adultCount: Number(adultCount),
      childCount: Number(childCount),
      totalAmount,
      status: "PENDING"
    };

    try {
      await createBooking(bookingData);
      alert("Booking created successfully! Status: Pending");
      navigate("/my-bookings");
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Booking failed");
      }
    }
  };

  const timeSlots = [
    { value: "10AM-12PM", label: "10:00 AM – 12:00 PM", icon: "🌅" },
    { value: "12PM-2PM",  label: "12:00 PM – 2:00 PM",  icon: "☀️" },
    { value: "2PM-4PM",   label: "2:00 PM – 4:00 PM",   icon: "🌤️" },
  ];

  return (
    <div className="bk-root">

      {/* Blobs */}
      <div className="bk-blob bk-blob-1" />
      <div className="bk-blob bk-blob-2" />

      {/* Page header */}
      <div className="bk-header">
        <button className="bk-back" onClick={() => navigate(-1)}>← Back</button>
        <span className="bk-tag">Step 1 of 2</span>
        <h1 className="bk-title">Book Your Visit</h1>
        <p className="bk-sub">Fill in your details and we'll reserve your spot instantly.</p>
      </div>

      <div className="bk-layout">

        {/* ── Form ── */}
        <div className="bk-form-card">
          <form onSubmit={handleSubmit} className="bk-form">

            {/* Visit Date */}
            <div className="bk-field">
              <label className="bk-label">
                <span className="bk-label-icon">📅</span> Visit Date
              </label>
              <input
                className="bk-input"
                type="date"
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
                <span className="bk-label-icon">👥</span> Guests
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
                    <button type="button" className="bk-counter-btn"
                      onClick={() => setAdultCount(Math.max(1, adultCount - 1))}>−</button>
                    <span className="bk-counter-val">{adultCount}</span>
                    <button type="button" className="bk-counter-btn"
                      onClick={() => setAdultCount(adultCount + 1)}>+</button>
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
                    <button type="button" className="bk-counter-btn"
                      onClick={() => setChildCount(Math.max(0, childCount - 1))}>−</button>
                    <span className="bk-counter-val">{childCount}</span>
                    <button type="button" className="bk-counter-btn"
                      onClick={() => setChildCount(childCount + 1)}>+</button>
                  </div>
                </div>

              </div>
            </div>

            <button type="submit" className="bk-submit-btn">
              Confirm Booking →
            </button>

          </form>
        </div>

        {/* ── Summary Sidebar ── */}
        <div className="bk-summary-card">
          <div className="bk-summary-header">Booking Summary</div>

          <div className="bk-summary-rows">
            <div className="bk-summary-row">
              <span>📅 Date</span>
              <span>{visitDate || "—"}</span>
            </div>
            <div className="bk-summary-row">
              <span>🕐 Slot</span>
              <span>{timeSlots.find(s => s.value === timeSlot)?.label}</span>
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
            <span>Total</span>
            <span className="bk-total-amount">₹{totalAmount}</span>
          </div>

          <div className="bk-summary-note">
            ⚠️ Payment required to confirm booking
          </div>

          <div className="bk-summary-badge">
            <span className="bk-badge-dot" /> Booking will be PENDING until payment
          </div>
        </div>

      </div>
    </div>
  );
}

export default BookingPage;