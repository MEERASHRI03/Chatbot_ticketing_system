import { useContext, useEffect, useState } from "react";
import { getUserBookings } from "../../services/bookingService";
import { createPayment } from "../../services/paymentService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/bookings.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");
  const navigate = useNavigate();
  const { userId } = useContext(AuthContext);

  const resolvedUserId = userId || localStorage.getItem("userId");

  const fetchBookings = () => {
    if (!resolvedUserId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    getUserBookings(resolvedUserId)
      .then((res) => {
        const updated = res.data
          .map((b) => ({ ...b, status: b.bookingStatus || "PENDING" }))
          .sort((a, b) => b.bookingId - a.bookingId);
        setBookings(updated);
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  };

  useEffect(() => {
    fetchBookings();
  }, [resolvedUserId]);

  const handlePayment = async (booking) => {
    if (booking.status === "CONFIRMED") { alert("Payment already completed."); return; }
    try {
      if (!resolvedUserId) {
        alert("User session not found. Please log in again.");
        return;
      }

      const paymentData = {
        booking: { bookingId: booking.bookingId },
        user: { userId: resolvedUserId },
        amount: booking.totalAmount,
        paymentMethod: "DUMMY",
        transactionId: "TXN" + Date.now(),
        paymentStatus: "SUCCESS"
      };
      await createPayment(paymentData);
      alert("Payment Successful! Ticket Generated");
      setBookings((prev) =>
        prev.map((b) => b.bookingId === booking.bookingId ? { ...b, status: "CONFIRMED" } : b)
      );
    } catch (error) {
      console.error(error);
      alert("Payment failed");
    }
  };

  if (loading) return (
    <div className="mb-loading">
      <div className="mb-spinner" />
      <p>Loading bookings…</p>
    </div>
  );

  const pendingBookings   = bookings.filter(b => b.status === "PENDING");
  const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED");
  const cancelledBookings = bookings.filter(b => b.status === "CANCELLED");

  const tabs = [
    { key: "PENDING",   label: "Pending",   count: pendingBookings.length },
    { key: "CONFIRMED", label: "Confirmed", count: confirmedBookings.length },
    { key: "CANCELLED", label: "Cancelled", count: cancelledBookings.length },
  ];

  const activeBookings =
    activeTab === "PENDING"   ? pendingBookings   :
    activeTab === "CONFIRMED" ? confirmedBookings :
    cancelledBookings;

  return (
    <div className="mb-root">

      {/* Header */}
      <div className="mb-header">
        <h1 className="mb-title">My Bookings</h1>
        <p className="mb-sub">Manage all your travel reservations.</p>
      </div>

      {/* Tabs */}
      <div className="mb-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`mb-tab ${activeTab === tab.key ? `mb-tab-active-${tab.key.toLowerCase()}` : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className={`mb-tab-num ${activeTab === tab.key ? `num-${tab.key.toLowerCase()}` : ""}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="mb-list">
        {activeBookings.length === 0 ? (
          <div className="mb-empty">
            <p>No {activeTab.toLowerCase()} bookings.</p>
            {activeTab === "PENDING" && (
              <button onClick={() => navigate("/places")}>Explore Places →</button>
            )}
          </div>
        ) : (
          activeBookings.map((b, i) => (
            <div key={b.bookingId} className={`mb-card mb-card-${activeTab.toLowerCase()}`}
              style={{ animationDelay: `${i * 0.06}s` }}>

              {/* Left accent bar */}
              <div className={`mb-accent-bar accent-${activeTab.toLowerCase()}`} />

              {/* Card content */}
              <div className="mb-card-content">

                {/* Top row */}
                <div className="mb-card-top">
                  <div>
                    <div className="mb-place">{b.place?.name || "Unknown Place"}</div>
                    <div className="mb-date">{b.visitDate} &nbsp;·&nbsp; {b.timeSlot}</div>
                  </div>
                  <div className="mb-amount">₹{b.totalAmount}</div>
                </div>

                {/* Divider */}
                <div className="mb-divider" />

                {/* Bottom row */}
                <div className="mb-card-bottom">
                  <div className="mb-guests">
                    <span>{b.adultCount} Adult{b.adultCount !== 1 ? "s" : ""}</span>
                    {b.childCount > 0 && <span>{b.childCount} Child{b.childCount !== 1 ? "ren" : ""}</span>}
                  </div>

                  <div className="mb-card-action">
                    {activeTab === "PENDING" && (
                      <button className="mb-btn mb-btn-pay" onClick={() => handlePayment(b)}>
                        Pay Now
                      </button>
                    )}
                    {activeTab === "CONFIRMED" && (
                      <button className="mb-btn mb-btn-ticket" onClick={() => navigate(`/ticket/${b.bookingId}`)}>
                        View Ticket
                      </button>
                    )}
                    {activeTab === "CANCELLED" && (
                      <span className="mb-refund-text">Refund in progress</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default MyBookings;
