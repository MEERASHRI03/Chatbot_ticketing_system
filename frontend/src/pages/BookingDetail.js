import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import { formatCurrency, formatDate, BOOKING_STATUS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import './Booking.css';

const BookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const bookingResponse = await bookingService.getBookingById(bookingId);
      setBooking(bookingResponse.data);
      
      try {
        const paymentResponse = await paymentService.getPaymentById(bookingResponse.data.bookingId);
        setPayment(paymentResponse.data);
      } catch (err) {
        // Payment might not exist yet
      }
    } catch (err) {
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    setProcessing(true);
    try {
      const paymentData = {
        bookingId: booking.bookingId,
        userId: user.userId,
        amount: booking.totalAmount,
        transactionId: `TXN-${Date.now()}`,
        paymentMethod: 'CREDIT_CARD',
        paymentStatus: 'SUCCESS'
      };
      
      const response = await paymentService.createPayment(paymentData);
      setPayment(response.data);
      setError('');
      
      // Update booking status
      await bookingService.updateBooking(booking.bookingId, {
        ...booking,
        bookingStatus: 'CONFIRMED'
      });
      
      setBooking(prev => ({ ...prev, bookingStatus: 'CONFIRMED' }));
    } catch (err) {
      setError('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancelBooking(booking.bookingId);
        navigate('/my-bookings');
      } catch (err) {
        setError('Failed to cancel booking');
      }
    }
  };

  if (loading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  if (!booking) {
    return <div className="container mt-5"><p>Booking not found</p></div>;
  }

  return (
    <div className="booking-container">
      <div className="container">
        <button onClick={() => navigate('/my-bookings')} className="btn btn-secondary mb-3">
          ← Back to Bookings
        </button>

        <div className="booking-grid">
          <div className="booking-details">
            <h1>Booking Details</h1>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="detail-card">
              <div className="detail-row">
                <span className="label">Booking ID:</span>
                <span className="value">#{booking.bookingId}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`badge status-${booking.bookingStatus.toLowerCase()}`}>
                  {booking.bookingStatus}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Place:</span>
                <span className="value">{booking.place?.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Location:</span>
                <span className="value">{booking.place?.city}, {booking.place?.state}</span>
              </div>
              <div className="detail-row">
                <span className="label">Visit Date:</span>
                <span className="value">{formatDate(booking.visitDate)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Time Slot:</span>
                <span className="value">{booking.timeSlot || 'Not specified'}</span>
              </div>
            </div>

            <div className="visitor-card">
              <h3>Visitor Details</h3>
              <div className="detail-row">
                <span className="label">Adults:</span>
                <span className="value">{booking.adultCount}</span>
              </div>
              <div className="detail-row">
                <span className="label">Children:</span>
                <span className="value">{booking.childCount}</span>
              </div>
            </div>

            <div className="pricing-card">
              <h3>Pricing</h3>
              <div className="detail-row">
                <span className="label">Adult Price:</span>
                <span className="value">{formatCurrency(booking.place?.adultPrice)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Child Price:</span>
                <span className="value">{formatCurrency(booking.place?.childPrice)}</span>
              </div>
              <div className="detail-row total">
                <span className="label">Total Amount:</span>
                <span className="value">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="payment-section">
            {payment ? (
              <div className="payment-card">
                <h2>Payment Information</h2>
                <div className="detail-row">
                  <span className="label">Transaction ID:</span>
                  <span className="value">{payment.transactionId}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Amount:</span>
                  <span className="value">{formatCurrency(payment.amount)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`badge status-${payment.paymentStatus.toLowerCase()}`}>
                    {payment.paymentStatus}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Method:</span>
                  <span className="value">{payment.paymentMethod}</span>
                </div>
              </div>
            ) : booking.bookingStatus === 'PENDING' ? (
              <div className="payment-card">
                <h2>Complete Payment</h2>
                <div className="payment-amount">
                  <p>Amount to Pay:</p>
                  <p className="amount">{formatCurrency(booking.totalAmount)}</p>
                </div>
                <button 
                  onClick={handleProcessPayment}
                  className="btn btn-primary btn-lg btn-block"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Pay Now'}
                </button>
                <button 
                  onClick={handleCancelBooking}
                  className="btn btn-danger btn-block mt-2"
                >
                  Cancel Booking
                </button>
              </div>
            ) : (
              <div className="payment-card">
                <h2>Booking Confirmed</h2>
                <p>Your booking has been confirmed. You will receive a ticket shortly.</p>
                <button 
                  onClick={() => navigate('/my-tickets')}
                  className="btn btn-primary btn-block"
                >
                  View Tickets
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
