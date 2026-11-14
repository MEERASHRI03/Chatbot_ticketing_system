import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getBookingById } from "../../services/bookingService";
import "../../styles/payment.css";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get("bookingId");
  const amountParam = searchParams.get("amount");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("Invalid booking reference.");
      setLoading(false);
      return;
    }

    getBookingById(bookingId)
      .then((res) => setBooking(res.data))
      .catch(() => setError("Could not load booking details."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePayment = async () => {
    try {
      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Please check your internet connection.");
        return;
      }

      setPaymentLoading(true);
      setError("");

      const amount = parseInt(amountParam || booking?.totalAmount || 0, 10);
      const userId = parseInt(localStorage.getItem("userId"), 10);
      const token = localStorage.getItem("token");

      if (!userId || isNaN(userId)) {
        throw new Error("User ID not found. Please log in again.");
      }

      if (!amount || amount <= 0) {
        throw new Error("Invalid amount.");
      }

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // STEP 1: Create Razorpay order from backend
      const orderRes = await fetch("http://localhost:8080/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: parseInt(bookingId, 10),
          userId,
          amount,
        }),
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        throw new Error(errText || "Failed to create payment order.");
      }

      const orderData = await orderRes.json();

      // STEP 2: Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "Travel Booking",
        description: `Booking #${bookingId}`,
        image: "/logo.svg",

        handler: async function (response) {
          try {
            // STEP 3: Verify payment in backend
            const verifyRes = await fetch("http://localhost:8080/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                bookingId: parseInt(bookingId, 10),
                userId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentMethod: "RAZORPAY",
              }),
            });

            if (!verifyRes.ok) {
              const errText = await verifyRes.text();
              throw new Error(errText || "Payment verification failed.");
            }

            navigate(`/ticket/${bookingId}?success=true`);
          } catch (err) {
            console.error("Verification error:", err);
            setError(err.message || "Payment succeeded but verification failed.");
          } finally {
            setPaymentLoading(false);
          }
        },

        prefill: {
          name: localStorage.getItem("userName") || "",
          email: localStorage.getItem("userEmail") || "",
        },

        theme: {
          color: "#2563eb",
        },

        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        setError(response.error?.description || "Payment failed.");
        setPaymentLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment start error:", err);
      setError(err.message || "Payment failed.");
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-loading">
          <div className="payment-spinner" />
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="payment-error">
          <span>❌</span>
          <p>{error}</p>
          <button onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    );
  }

  const amount = parseInt(amountParam || booking?.totalAmount || 0, 10);

  return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="payment-header">
          <div className="payment-icon">💳</div>
          <h2>Complete Your Payment</h2>
          <p>Secure payment powered by Razorpay</p>
        </div>

        <div className="payment-details">
          <div className="payment-detail-row">
            <span>Booking ID</span>
            <span>#{bookingId}</span>
          </div>

          {booking?.visitDate && (
            <div className="payment-detail-row">
              <span>Visit Date</span>
              <span>{booking.visitDate}</span>
            </div>
          )}

          {booking?.timeSlot && (
            <div className="payment-detail-row">
              <span>Time Slot</span>
              <span>{booking.timeSlot}</span>
            </div>
          )}

          {booking?.adultCount > 0 && (
            <div className="payment-detail-row">
              <span>Adults</span>
              <span>{booking.adultCount}</span>
            </div>
          )}

          {booking?.childCount > 0 && (
            <div className="payment-detail-row">
              <span>Children</span>
              <span>{booking.childCount}</span>
            </div>
          )}

          <div className="payment-detail-row payment-total-row">
            <span>Total Amount</span>
            <span className="payment-amount">₹{amount}</span>
          </div>
        </div>

        <div className="payment-actions">
          <button
            className="pay-now-btn"
            onClick={handlePayment}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <>
                <div className="btn-spinner" /> Processing...
              </>
            ) : (
              <>💳 Pay ₹{amount}</>
            )}
          </button>

          <button
            className="cancel-payment-btn"
            onClick={() => navigate(-1)}
            disabled={paymentLoading}
          >
            ← Go Back
          </button>
        </div>

        <div className="payment-secure-badge">
          🔒 256-bit SSL encrypted · Secured by Razorpay
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;