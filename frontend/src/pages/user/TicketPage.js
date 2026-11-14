import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import axios from "../../api/axiosConfig";
import { cancelTicket } from "../../services/ticketService";
import CancelTicketModal from "./CancelTicketModal";
import "../../styles/ticket.css";

function TicketPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

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

  useEffect(() => {
    setLoading(true);
    if (bookingId) {
      axios
        .get(`/api/tickets/booking/${bookingId}`)
        .then((res) => {
          if (res.data) setTickets([res.data]);
        })
        .catch((err) => console.error("Error fetching ticket by bookingId:", err))
        .finally(() => setLoading(false));
    } else {
      const userId = getEffectiveUserId();
      const endpoint = userId ? `/api/tickets/user/${userId}` : "/api/tickets";
      axios
        .get(endpoint)
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : [res.data];
          if (list.length === 0 && userId) {
            // fallback to all tickets if user endpoint returns empty
            axios.get("/api/tickets").then((allRes) => {
              const sorted = (allRes.data || []).sort((a, b) => b.ticketId - a.ticketId);
              setTickets(sorted);
            }).catch(() => setTickets([]));
          } else {
            const sorted = list.sort((a, b) => b.ticketId - a.ticketId);
            setTickets(sorted);
          }
        })
        .catch((err) => {
          console.error("Error fetching tickets:", err);
          axios.get("/api/tickets").then((allRes) => {
            const sorted = (allRes.data || []).sort((a, b) => b.ticketId - a.ticketId);
            setTickets(sorted);
          }).catch(() => setTickets([]));
        })
        .finally(() => setLoading(false));
    }
  }, [bookingId]);

  const openCancelModal = (ticketId) => {
    setSelectedTicket(ticketId);
    setShowModal(true);
  };

  const confirmCancel = async (reason) => {
    try {
      await cancelTicket(selectedTicket, reason);
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketId === selectedTicket ? { ...t, ticketStatus: "CANCELLED" } : t
        )
      );
      alert("Ticket cancelled successfully");
    } catch (error) {
      console.error(error);
      alert("Cancel failed");
    }
    setShowModal(false);
  };

  const handleDownload = (ticket) => {
    const ref = ticket.booking?.bookingRef || ticket.bookingRef || ticket.ticketNumber;
    if (!ref) {
      alert("No ticket or booking reference available.");
      return;
    }
    const downloadUrl = `http://localhost:8080/api/tickets/${ref}/download`;
    window.open(downloadUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="tk-empty">
        <div className="tk-empty-icon">🎟️</div>
        <h3>Loading tickets…</h3>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="tk-empty">
        <div className="tk-empty-icon">🎟️</div>
        <h3>No tickets found</h3>
        <p>Your tickets will appear here once booked and paid.</p>
        <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "center" }}>
          <button onClick={() => navigate("/places")} style={{ padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>
            Explore Places →
          </button>
          <button onClick={() => navigate("/chatbot")} style={{ background: "#4f46e5", color: "#fff", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer" }}>
            Book with Chatbot 💬
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tk-root">
      {/* Header */}
      <div className="tk-header">
        <h1 className="tk-title">My Tickets</h1>
        <p className="tk-sub">Your verified e-tickets and entry passes for upcoming visits.</p>
      </div>

      {/* Tickets */}
      <div className="tk-list">
        {tickets.map((ticket, i) => (
          <div
            key={ticket.ticketId}
            className={`tk-card ${ticket.ticketStatus === "CANCELLED" ? "tk-card-cancelled" : ""}`}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            {/* Top section */}
            <div className="tk-card-top">
              <div className="tk-card-top-left">
                <div className="tk-place-name">{ticket.placeName || ticket.booking?.place?.name || "Monument Pass"}</div>
                <div className="tk-ticket-num">#{ticket.ticketNumber}</div>
                {ticket.booking?.bookingRef && (
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    Booking Ref: {ticket.booking.bookingRef}
                  </div>
                )}
              </div>
              <span className={`tk-status-badge badge-${(ticket.ticketStatus || "ACTIVE").toLowerCase()}`}>
                {ticket.ticketStatus}
              </span>
            </div>

            {/* Dashed divider */}
            <div className="tk-dash-divider">
              <div className="tk-notch tk-notch-left" />
              <div className="tk-dashes" />
              <div className="tk-notch tk-notch-right" />
            </div>

            {/* Body */}
            <div className="tk-card-body">
              {/* Details */}
              <div className="tk-details">
                <div className="tk-detail-item">
                  <span className="tk-detail-label">📅 Visit Date</span>
                  <span className="tk-detail-val">{ticket.visitDate || ticket.booking?.visitDate || "—"}</span>
                </div>
                <div className="tk-detail-item">
                  <span className="tk-detail-label">👥 Visitors</span>
                  <span className="tk-detail-val">{ticket.numberOfVisitors || ((ticket.booking?.adultCount || 1) + (ticket.booking?.childCount || 0))}</span>
                </div>
                <div className="tk-detail-item">
                  <span className="tk-detail-label">💰 Total Paid</span>
                  <span className="tk-detail-val tk-amount">₹{ticket.amount || ticket.booking?.totalAmount || 0}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className={`tk-qr ${ticket.ticketStatus === "CANCELLED" ? "tk-qr-faded" : ""}`}>
                <QRCode value={ticket.qrPayload || ticket.qrCode || ticket.ticketNumber || "VALID"} size={80} />
                <div className="tk-qr-label">Scan at Entry</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="tk-card-footer" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                className="tk-download-btn"
                style={{
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onClick={() => handleDownload(ticket)}
              >
                📥 Download PDF Ticket
              </button>

              {ticket.ticketStatus === "ACTIVE" && (
                <button
                  className="tk-cancel-btn"
                  onClick={() => openCancelModal(ticket.ticketId)}
                >
                  Cancel Ticket
                </button>
              )}

              {ticket.ticketStatus === "CANCELLED" && (
                <button
                  className="tk-refund-btn"
                  onClick={() => navigate(`/refund/${ticket.ticketId}`)}
                >
                  Track Refund →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <CancelTicketModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmCancel}
      />
    </div>
  );
}

export default TicketPage;
