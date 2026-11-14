import { useEffect, useState } from "react";
import { getUserBookings } from "../../services/bookingService";
import { createPayment } from "../../services/paymentService";
import { useNavigate } from "react-router-dom";
import "../../styles/bookings.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("CONFIRMED");
  const [payingBookingId, setPayingBookingId] = useState(null);
  const navigate = useNavigate();

  // Ensure Razorpay SDK script is loaded for pending booking payments
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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

  const fetchBookings = () => {
    const userId = getEffectiveUserId();
    if (userId) {
      getUserBookings(userId)
        .then((res) => {
          const updated = (res.data || [])
            .map((b) => {
              const bStatus = (b.bookingStatus || b.status || "").toUpperCase();
              const isConfirmed = bStatus === "CONFIRMED" || bStatus === "PAID";
              const isCancelled = bStatus === "CANCELLED" || bStatus === "FAILED";
              return {
                ...b,
                status: isConfirmed ? "CONFIRMED" : (isCancelled ? "CANCELLED" : "PENDING")
              };
            })
            .sort((a, b) => b.bookingId - a.bookingId);
          setBookings(updated);
          // Set initial tab to CONFIRMED if there are confirmed ones, else PENDING
          const hasConfirmed = updated.some(b => b.status === "CONFIRMED");
          const hasPending = updated.some(b => b.status === "PENDING");
          if (!hasConfirmed && hasPending) {
            setActiveTab("PENDING");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadTicket = (bookingRef, bookingId) => {
    const ref = bookingRef || bookingId;
    if (!ref) {
      alert("No booking reference available for ticket download.");
      return;
    }
    const downloadUrl = `http://localhost:8080/api/tickets/${ref}/download`;
    window.open(downloadUrl, "_blank");
  };

  const handlePayment = async (booking) => {
    if (booking.status === "CONFIRMED") {
      alert("Payment already completed.");
      return;
    }

    const userId = getEffectiveUserId();
    const token = localStorage.getItem("token");
    setPayingBookingId(booking.bookingId);

    // Try Razorpay flow first
    if (window.Razorpay) {
      try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const orderRes = await fetch("http://localhost:8080/api/payments/create-order", {
          method: "POST",
          headers,
          body: JSON.stringify({
            bookingId: booking.bookingId,
            bookingRef: booking.bookingRef,
            userId: userId,
            amount: booking.totalAmount ? Math.round(booking.totalAmount) : 0,
          }),
        });

        if (!orderRes.ok) {
          const errText = await orderRes.text();
          throw new Error(errText || "Failed to create Razorpay order.");
        }

        const orderData = await orderRes.json();

        const options = {
          key: orderData.key || "rzp_test_SUK0BZ6I8Jz44v",
          amount: orderData.amount,
          currency: "INR",
          name: "Online Chatbot Ticketing",
          description: `Booking #${booking.bookingRef || booking.bookingId}`,
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              const verifyRes = await fetch("http://localhost:8080/api/payments/verify", {
                method: "POST",
                headers,
                body: JSON.stringify({
                  bookingId: booking.bookingId,
                  bookingRef: booking.bookingRef,
                  userId: userId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  paymentMethod: "RAZORPAY",
                }),
              });

              if (!verifyRes.ok) {
                throw new Error("Payment signature verification failed.");
              }

              alert("🎉 Payment Successful! Ticket has been generated.");
              setBookings((prev) =>
                prev.map((b) =>
                  b.bookingId === booking.bookingId ? { ...b, status: "CONFIRMED" } : b
                )
              );
              setActiveTab("CONFIRMED");
            } catch (vErr) {
              alert("Verification error: " + vErr.message);
            } finally {
              setPayingBookingId(null);
            }
          },
          modal: {
            ondismiss: function () {
              setPayingBookingId(null);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn("Razorpay flow failed, falling back to direct payment:", err);
      }
    }

    // Fallback payment
    try {
      const paymentData = {
        booking: { bookingId: booking.bookingId },
        user: { userId: userId },
        amount: booking.totalAmount,
        paymentMethod: "CARD",
        transactionId: "TXN" + Date.now(),
        paymentStatus: "SUCCESS",
      };
      await createPayment(paymentData);
      alert("Payment Successful! Ticket Generated");
      setBookings((prev) =>
        prev.map((b) => (b.bookingId === booking.bookingId ? { ...b, status: "CONFIRMED" } : b))
      );
      setActiveTab("CONFIRMED");
    } catch (error) {
      console.error("Payment error:", error);
      alert(error?.response?.data?.message || "Payment failed");
    } finally {
      setPayingBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mb-loading">
        <div className="mb-spinner" />
        <p>Loading bookings…</p>
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED");

  const tabs = [
    { key: "CONFIRMED", label: "Confirmed / Paid", count: confirmedBookings.length },
    { key: "PENDING", label: "Pending", count: pendingBookings.length },
    { key: "CANCELLED", label: "Cancelled", count: cancelledBookings.length },
  ];

  const activeBookings =
    activeTab === "PENDING"
      ? pendingBookings
      : activeTab === "CONFIRMED"
      ? confirmedBookings
      : cancelledBookings;

  return (
    <div className="mb-root">
      {/* Header */}
      <div className="mb-header">
        <h1 className="mb-title">My Bookings</h1>
        <p className="mb-sub">Track your trips, view issued tickets, and download PDF passes.</p>
      </div>

      {/* Tabs */}
      <div className="mb-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`mb-tab ${
              activeTab === tab.key ? `mb-tab-active-${tab.key.toLowerCase()}` : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span
              className={`mb-tab-num ${
                activeTab === tab.key ? `num-${tab.key.toLowerCase()}` : ""
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="mb-list">
        {activeBookings.length === 0 ? (
          <div className="mb-empty">
            <p>No {activeTab.toLowerCase()} bookings found.</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "12px", justifyContent: "center" }}>
              <button onClick={() => navigate("/places")}>Explore Places →</button>
              <button onClick={() => navigate("/chatbot")} style={{ background: "#4f46e5", color: "#fff" }}>
                Book with Chatbot 💬
              </button>
            </div>
          </div>
        ) : (
          activeBookings.map((b, i) => (
            <div
              key={b.bookingId}
              className={`mb-card mb-card-${activeTab.toLowerCase()}`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Left accent bar */}
              <div className={`mb-accent-bar accent-${activeTab.toLowerCase()}`} />

              {/* Card content */}
              <div className="mb-card-content">
                {/* Top row */}
                <div className="mb-card-top">
                  <div>
                    <div className="mb-place">{b.place?.name || "Heritage Monument"}</div>
                    <div className="mb-date">
                      📅 {b.visitDate} {b.timeSlot ? ` · ${b.timeSlot}` : ""}
                    </div>
                    {b.bookingRef && (
                      <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "3px" }}>
                        Ref: <strong style={{ color: "#334155" }}>{b.bookingRef}</strong>
                      </div>
                    )}
                  </div>
                  <div className="mb-amount">₹{b.totalAmount}</div>
                </div>

                {/* Divider */}
                <div className="mb-divider" />

                {/* Bottom row */}
                <div className="mb-card-bottom">
                  <div className="mb-guests">
                    <span>{b.adultCount} Adult{b.adultCount !== 1 ? "s" : ""}</span>
                    {b.childCount > 0 && (
                      <span> · {b.childCount} Child{b.childCount !== 1 ? "ren" : ""}</span>
                    )}
                  </div>

                  <div className="mb-card-action" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {activeTab === "PENDING" && (
                      <button
                        className="mb-btn mb-btn-pay"
                        onClick={() => handlePayment(b)}
                        disabled={payingBookingId === b.bookingId}
                      >
                        {payingBookingId === b.bookingId ? "Processing…" : "Pay Now (Razorpay)"}
                      </button>
                    )}
                    {activeTab === "CONFIRMED" && (
                      <>
                        <button
                          className="mb-btn mb-btn-ticket"
                          onClick={() => navigate(`/ticket/${b.bookingId}`)}
                        >
                          View Ticket
                        </button>
                        <button
                          className="mb-btn"
                          style={{
                            background: "linear-gradient(135deg, #059669, #10b981)",
                            color: "#fff",
                            border: "none",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                          }}
                          onClick={() => handleDownloadTicket(b.bookingRef, b.bookingId)}
                        >
                          📥 Download PDF
                        </button>
                      </>
                    )}
                    {activeTab === "CANCELLED" && (
                      <span className="mb-refund-text">Cancelled / Refunded</span>
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
