import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRefundByTicket } from "../../services/refundService";
import "../../styles/refundTracking.css";

function RefundTracking() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchRefund(); }, [ticketId]);

  const fetchRefund = async () => {
    try {
      const res = await getRefundByTicket(ticketId);
      if (res.data) setRefund(res.data);
      else setError("No refund found for this ticket.");
    } catch (err) {
      console.error("Error fetching refund:", err);
      setError(err.response?.data?.message || "Failed to fetch refund details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="rf-loading">
      <div className="rf-spinner" />
      <p>Loading refund details…</p>
    </div>
  );

  if (error) return (
    <div className="rf-error">
      <div className="rf-error-icon">⚠️</div>
      <p>{error}</p>
      <button onClick={() => navigate("/ticket")}>← Back to Tickets</button>
    </div>
  );

  const status = refund?.refundStatus;

  const steps = ["PENDING", "PROCESSED"];
  const currentStep =
    status === "REJECTED"  ? -1 :
    status === "PROCESSED" ? 1  : 0;

  return (
    <div className="rf-root">

      {/* Header */}
      <div className="rf-header">
        <button className="rf-back" onClick={() => navigate("/ticket")}>← Back to Tickets</button>
        <h1 className="rf-title">Refund Tracking</h1>
        <p className="rf-sub">Ticket #{refund?.ticket?.ticketId || ticketId}</p>
      </div>

      <div className="rf-card">

        {/* Status badge */}
        <div className="rf-status-row">
          <span className="rf-status-label">Current Status</span>
          <span className={`rf-status-badge badge-${status?.toLowerCase()}`}>
            {status === "PENDING"   && "⏳ Pending"}
            {status === "PROCESSED" && "✓ Processed"}
            {status === "REJECTED"  && "✕ Rejected"}
          </span>
        </div>

        {/* Progress bar (only for non-rejected) */}
        {status !== "REJECTED" && (
          <div className="rf-progress">
            {steps.map((step, i) => (
              <div key={step} className="rf-step-wrap">
                <div className={`rf-step ${i <= currentStep ? "rf-step-done" : ""}`}>
                  <div className="rf-step-dot">{i <= currentStep ? "✓" : i + 1}</div>
                  <div className="rf-step-label">{step === "PENDING" ? "Refund Requested" : "Refund Processed"}</div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`rf-step-line ${currentStep >= 1 ? "rf-line-done" : ""}`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Rejected note */}
        {status === "REJECTED" && (
          <div className="rf-rejected-note">
            ❌ Your refund request was rejected. Please contact support for more details.
          </div>
        )}

        <div className="rf-divider" />

        {/* Details */}
        <div className="rf-details">
          <div className="rf-detail-row">
            <span className="rf-detail-label">Refund Amount</span>
            <span className="rf-detail-val rf-amount">₹{refund?.refundAmount ?? "N/A"}</span>
          </div>
          <div className="rf-detail-row">
            <span className="rf-detail-label">Cancellation Reason</span>
            <span className="rf-detail-val">{refund?.reason || "N/A"}</span>
          </div>
          <div className="rf-detail-row">
            <span className="rf-detail-label">Ticket ID</span>
            <span className="rf-detail-val">#{refund?.ticket?.ticketId || ticketId}</span>
          </div>
        </div>

        {status === "PROCESSED" && (
          <div className="rf-success-note">
            🎉 Your refund has been processed. Amount will reflect in 3–5 business days.
          </div>
        )}

      </div>
    </div>
  );
}

export default RefundTracking;