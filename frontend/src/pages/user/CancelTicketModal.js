import { useState } from "react";
import "../../styles/cancelModal.css";

function CancelTicketModal({ isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Please enter a cancellation reason");
      return;
    }
    onConfirm(reason);
    setReason("");
  };

  return (
    <div className="cm-overlay" onClick={onClose}>
      <div className="cm-box" onClick={(e) => e.stopPropagation()}>

        {/* Icon */}
        <div className="cm-icon">🎟️</div>

        {/* Header */}
        <h3 className="cm-title">Cancel Ticket</h3>
        <p className="cm-sub">This action cannot be undone. A refund request will be created automatically.</p>

        {/* Reason input */}
        <div className="cm-field">
          <label className="cm-label">Reason for cancellation</label>
          <textarea
            className="cm-textarea"
            placeholder="e.g. Change of plans, unable to travel..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>

        {/* Buttons */}
        <div className="cm-actions">
          <button className="cm-btn-cancel" onClick={handleSubmit}>
            Yes, Cancel Ticket
          </button>
          <button className="cm-btn-close" onClick={onClose}>
            Keep Ticket
          </button>
        </div>

      </div>
    </div>
  );
}

export default CancelTicketModal;