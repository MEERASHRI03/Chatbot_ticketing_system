import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import placeService from '../services/placeService';
import bookingService from '../services/bookingService';
import { formatCurrency } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import './PlaceDetail.css';

const PlaceDetail = () => {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    visitDate: '',
    timeSlot: '',
    adultCount: 1,
    childCount: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPlace();
  }, [placeId]);

  const fetchPlace = async () => {
    try {
      setLoading(true);
      const response = await placeService.getPlaceById(placeId);
      setPlace(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load place details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === 'adultCount' || name === 'childCount' ? parseInt(value) : value
    }));
  };

  const calculateTotal = () => {
    if (!place) return 0;
    const adultsTotal = bookingData.adultCount * place.adultPrice;
    const childrenTotal = bookingData.childCount * place.childPrice;
    return adultsTotal + childrenTotal;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const bookingPayload = {
        userId: user.userId,
        placeId: parseInt(placeId),
        visitDate: bookingData.visitDate,
        timeSlot: bookingData.timeSlot,
        adultCount: bookingData.adultCount,
        childCount: bookingData.childCount,
        totalAmount: calculateTotal(),
        bookingStatus: 'PENDING'
      };

      const response = await bookingService.createBooking(bookingPayload);
      navigate(`/booking/${response.data.bookingId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  if (!place) {
    return <div className="container mt-5"><p>Place not found</p></div>;
  }

  return (
    <div className="place-detail-container">
      <div className="container">
        <button onClick={() => navigate('/places')} className="btn btn-secondary mb-3">
          ← Back to Places
        </button>

        <div className="detail-grid">
          <div className="detail-image">
            <div className="image-placeholder">🏨</div>
          </div>

          <div className="detail-content">
            <h1>{place.name}</h1>
            
            <div className="detail-location">
              <span className="badge">{place.city}</span>
              <span className="badge">{place.state}</span>
            </div>

            <p className="description">{place.description}</p>

            <div className="detail-info">
              <div className="info-row">
                <span className="label">Timings:</span>
                <span>{place.openingTime} - {place.closingTime}</span>
              </div>
              <div className="info-row">
                <span className="label">Adult Price:</span>
                <span className="price">{formatCurrency(place.adultPrice)}</span>
              </div>
              <div className="info-row">
                <span className="label">Child Price:</span>
                <span className="price">{formatCurrency(place.childPrice)}</span>
              </div>
              <div className="info-row">
                <span className="label">Available Slots:</span>
                <span>{place.availableSlots}</span>
              </div>
            </div>

            <div className="booking-form">
              <h2>Make a Booking</h2>
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleBooking}>
                <div className="form-group">
                  <label htmlFor="visitDate">Visit Date</label>
                  <input
                    type="date"
                    id="visitDate"
                    name="visitDate"
                    value={bookingData.visitDate}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="timeSlot">Time Slot</label>
                  <input
                    type="time"
                    id="timeSlot"
                    name="timeSlot"
                    value={bookingData.timeSlot}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="adultCount">Adults</label>
                    <input
                      type="number"
                      id="adultCount"
                      name="adultCount"
                      value={bookingData.adultCount}
                      onChange={handleInputChange}
                      min="1"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="childCount">Children</label>
                    <input
                      type="number"
                      id="childCount"
                      name="childCount"
                      value={bookingData.childCount}
                      onChange={handleInputChange}
                      min="0"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="total-section">
                  <span>Total Amount:</span>
                  <span className="total-price">{formatCurrency(calculateTotal())}</span>
                </div>

                <button type="submit" className="btn btn-primary btn-lg btn-block" 
                  disabled={submitting || !user}>
                  {submitting ? 'Processing...' : 'Proceed to Booking'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;
