import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../services/bookingService';
import { formatCurrency, formatDate, BOOKING_STATUS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import './MyBookings.css';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchMyBookings();
  }, [user]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings(user.userId);
      setBookings(response.data || []);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = filterStatus === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.bookingStatus === filterStatus);

  const handleViewDetails = (bookingId) => {
    navigate(`/booking/${bookingId}`);
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancelBooking(bookingId);
        fetchMyBookings();
      } catch (err) {
        setError('Failed to cancel booking');
      }
    }
  };

  if (loading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  return (
    <div className="my-bookings-container">
      <div className="container">
        <h1>My Bookings</h1>

        <div className="filter-section">
          <div className="filter-tabs">
            {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(status => (
              <button
                key={status}
                className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {filteredBookings.length > 0 ? (
          <div className="bookings-list">
            {filteredBookings.map(booking => (
              <div key={booking.bookingId} className="booking-item">
                <div className="booking-header">
                  <h3>{booking.place?.name}</h3>
                  <span className={`badge status-${booking.bookingStatus.toLowerCase()}`}>
                    {booking.bookingStatus}
                  </span>
                </div>

                <div className="booking-body">
                  <div className="info-column">
                    <p><strong>Booking ID:</strong> #{booking.bookingId}</p>
                    <p><strong>Location:</strong> {booking.place?.city}, {booking.place?.state}</p>
                    <p><strong>Visit Date:</strong> {formatDate(booking.visitDate)}</p>
                  </div>

                  <div className="info-column">
                    <p><strong>Guests:</strong> {booking.adultCount} Adults, {booking.childCount} Children</p>
                    <p><strong>Time:</strong> {booking.timeSlot || 'Not specified'}</p>
                  </div>

                  <div className="info-column">
                    <p><strong>Total Amount:</strong></p>
                    <p className="amount">{formatCurrency(booking.totalAmount)}</p>
                  </div>
                </div>

                <div className="booking-actions">
                  <button 
                    onClick={() => handleViewDetails(booking.bookingId)}
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </button>
                  {booking.bookingStatus === 'PENDING' && (
                    <button 
                      onClick={() => handleCancelBooking(booking.bookingId)}
                      className="btn btn-danger btn-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-bookings">
            <p>No bookings found.</p>
            <button onClick={() => navigate('/places')} className="btn btn-primary">
              Browse Destinations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
