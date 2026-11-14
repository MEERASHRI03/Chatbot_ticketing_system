import React from "react";

const BookingSummaryCard = ({ summary, onConfirm, onEdit }) => {
  const { selectedPlace, visitDate, timeSlot, adultCount, childCount, totalAmount } = summary;

  return (
    <div className="booking-summary-card">
      <div className="summary-header">
        <span className="summary-icon">🎟️</span>
        <h3>Booking Summary</h3>
      </div>
      <div className="summary-body">
        <div className="summary-row">
          <span className="summary-label">📍 Place</span>
          <span className="summary-value">{selectedPlace?.name}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">📅 Date</span>
          <span className="summary-value">{visitDate}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">🕐 Time Slot</span>
          <span className="summary-value">{timeSlot}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">👨 Adults</span>
          <span className="summary-value">{adultCount}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">👧 Children</span>
          <span className="summary-value">{childCount}</span>
        </div>
        <div className="summary-divider" />
        <div className="summary-row summary-total">
          <span className="summary-label">💰 Total</span>
          <span className="summary-value total-amount">₹{totalAmount}</span>
        </div>
      </div>
      <div className="summary-actions">
        <button className="summary-btn confirm-btn" onClick={onConfirm}>
          ✅ Confirm Booking
        </button>
        <button className="summary-btn edit-btn" onClick={onEdit}>
          ✏️ Edit Details
        </button>
      </div>
    </div>
  );
};

export default BookingSummaryCard;
