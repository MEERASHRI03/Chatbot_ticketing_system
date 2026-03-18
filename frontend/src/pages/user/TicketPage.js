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
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    if (bookingId) {
      axios.get(`/api/tickets/booking/${bookingId}`)
        .then((res) => setTickets([res.data]))
        .catch((err) => console.error(err));
    } else {
      axios.get("/api/tickets")
        .then((res) => {
          const sorted = res.data.sort((a, b) => b.ticketId - a.ticketId);
          setTickets(sorted);
        })
        .catch((err) => console.error(err));
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

  if (tickets.length === 0) {
    return (
      <div className="tk-empty">
        <div className="tk-empty-icon">🎟️</div>
        <h3>No tickets found</h3>
        <p>Your tickets will appear here after payment.</p>
      </div>
    );
  }

  return (
    <div className="tk-root">

      {/* Header */}
      <div className="tk-header">
        <h1 className="tk-title">My Tickets</h1>
        <p className="tk-sub">Your e-tickets for upcoming visits.</p>
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
                <div className="tk-place-name">{ticket.placeName}</div>
                <div className="tk-ticket-num">#{ticket.ticketNumber}</div>
              </div>
              <span className={`tk-status-badge badge-${ticket.ticketStatus.toLowerCase()}`}>
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
                  <span className="tk-detail-label">📅 Date</span>
                  <span className="tk-detail-val">{ticket.visitDate}</span>
                </div>
                <div className="tk-detail-item">
                  <span className="tk-detail-label">👥 Visitors</span>
                  <span className="tk-detail-val">{ticket.numberOfVisitors}</span>
                </div>
                <div className="tk-detail-item">
                  <span className="tk-detail-label">💰 Paid</span>
                  <span className="tk-detail-val tk-amount">₹{ticket.amount}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className={`tk-qr ${ticket.ticketStatus === "CANCELLED" ? "tk-qr-faded" : ""}`}>
                <QRCode value={ticket.qrCode} size={80} />
                <div className="tk-qr-label">Scan at Entry</div>
              </div>

            </div>

            {/* Action */}
            {ticket.ticketStatus === "ACTIVE" && (
              <div className="tk-card-footer">
                <button
                  className="tk-cancel-btn"
                  onClick={() => openCancelModal(ticket.ticketId)}
                >
                  Cancel Ticket
                </button>
              </div>
            )}

            {ticket.ticketStatus === "CANCELLED" && (
              <div className="tk-card-footer">
                <button
                  className="tk-refund-btn"
                  onClick={() => navigate(`/refund/${ticket.ticketId}`)}
                >
                  Track Refund →
                </button>
              </div>
            )}

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