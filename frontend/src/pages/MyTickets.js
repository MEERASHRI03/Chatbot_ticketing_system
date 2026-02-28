import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ticketService from '../services/ticketService';
import refundService from '../services/refundService';
import QRCode from 'qrcode.react';
import { formatDate, TICKET_STATUS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import './MyTickets.css';

const MyTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [requestingRefund, setRequestingRefund] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getAllTickets();
      setTickets(response.data || []);
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = (ticket) => {
    const element = document.getElementById(`ticket-${ticket.ticketId}`);
    if (element) {
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write(element.innerHTML);
      printWindow.print();
    }
  };

  const handleRequestRefund = async (ticketId) => {
    if (!refundReason.trim()) {
      setError('Please provide a reason for refund');
      return;
    }

    setRequestingRefund(ticketId);
    try {
      await refundService.requestRefund(ticketId, refundReason);
      setRefundReason('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      setError('Failed to request refund');
    } finally {
      setRequestingRefund(null);
    }
  };

  if (loading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  return (
    <div className="my-tickets-container">
      <div className="container">
        <h1>My Tickets</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        {tickets.length > 0 ? (
          <div className="tickets-list">
            {tickets.map(ticket => (
              <div key={ticket.ticketId} className="ticket-card">
                <div className="ticket-header">
                  <div>
                    <h3>{ticket.placeName}</h3>
                    <p className="ticket-number">Ticket: {ticket.ticketNumber}</p>
                  </div>
                  <span className={`badge status-${ticket.ticketStatus.toLowerCase()}`}>
                    {ticket.ticketStatus}
                  </span>
                </div>

                <div className="ticket-body">
                  <div className="ticket-info">
                    <div className="info-item">
                      <span className="label">Visit Date:</span>
                      <span>{formatDate(ticket.visitDate)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Visitors:</span>
                      <span>{ticket.numberOfVisitors}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Amount:</span>
                      <span>₹{ticket.amount}</span>
                    </div>
                  </div>

                  <div className="ticket-qr">
                    <QRCode 
                      id={`qr-${ticket.ticketId}`}
                      value={ticket.qrCode} 
                      size={128}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>

                <div className="ticket-actions">
                  <button 
                    onClick={() => handleDownloadTicket(ticket)}
                    className="btn btn-primary btn-sm"
                  >
                    Download
                  </button>
                  {ticket.ticketStatus === 'ACTIVE' && (
                    <button 
                      onClick={() => setSelectedTicket(ticket.ticketId)}
                      className="btn btn-warning btn-sm"
                    >
                      Request Refund
                    </button>
                  )}
                </div>

                {selectedTicket === ticket.ticketId && (
                  <div className="refund-form">
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Reason for refund"
                      className="form-control"
                      rows="3"
                    ></textarea>
                    <div className="form-actions">
                      <button 
                        onClick={() => handleRequestRefund(ticket.ticketId)}
                        className="btn btn-primary btn-sm"
                        disabled={requestingRefund === ticket.ticketId}
                      >
                        {requestingRefund === ticket.ticketId ? 'Requesting...' : 'Request Refund'}
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedTicket(null);
                          setRefundReason('');
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-tickets">
            <p>No tickets found.</p>
            <button onClick={() => navigate('/places')} className="btn btn-primary">
              Book Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
