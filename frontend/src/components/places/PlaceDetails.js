import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPlaceById } from "../../services/PlaceService";
import "../../styles/placeDetails.css";

function PlaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    getPlaceById(id)
      .then(res => setPlace(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!place) {
    return (
      <div className="pd-loading">
        <div className="pd-spinner" />
        <p>Loading place details…</p>
      </div>
    );
  }

  return (
    <div className="pd-root">

      {/* Hero Banner */}
      <div className="pd-hero">
        <div className="pd-hero-overlay" />
        <div className="pd-hero-content">
          <button className="pd-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="pd-hero-emoji">🏞️</div>
          <h1 className="pd-hero-name">{place.name}</h1>
          <div className="pd-hero-location">📍 {place.city}, {place.state}</div>
        </div>
      </div>

      {/* Content */}
      <div className="pd-content">

        {/* Description card */}
        <div className="pd-card pd-desc-card">
          <div className="pd-card-label">About this place</div>
          <p className="pd-description">{place.description || "A wonderful destination waiting to be explored."}</p>
        </div>

        {/* Info grid */}
        <div className="pd-info-grid">

          <div className="pd-info-card">
            <div className="pd-info-icon">🕐</div>
            <div className="pd-info-body">
              <div className="pd-info-label">Opening Hours</div>
              <div className="pd-info-val">{place.openingTime} – {place.closingTime}</div>
            </div>
          </div>

          <div className="pd-info-card">
            <div className="pd-info-icon">🎫</div>
            <div className="pd-info-body">
              <div className="pd-info-label">Available Slots</div>
              <div className="pd-info-val">{place.availableSlots} slots left</div>
            </div>
          </div>

          <div className="pd-info-card">
            <div className="pd-info-icon">👨‍👩‍👧</div>
            <div className="pd-info-body">
              <div className="pd-info-label">Adult Ticket</div>
              <div className="pd-info-val pd-price">₹{place.adultPrice}</div>
            </div>
          </div>

          <div className="pd-info-card">
            <div className="pd-info-icon">🧒</div>
            <div className="pd-info-body">
              <div className="pd-info-label">Child Ticket</div>
              <div className="pd-info-val pd-price">₹{place.childPrice}</div>
            </div>
          </div>

        </div>

        {/* Book CTA */}
        <div className="pd-book-bar">
          <div className="pd-book-info">
            <span className="pd-book-from">Starting from</span>
            <span className="pd-book-price">₹{Math.min(place.adultPrice, place.childPrice)}</span>
          </div>
          <button
            className="pd-book-btn"
            onClick={() => navigate(`/booking/${place.placeId}`)}
          >
            Book Now →
          </button>
        </div>

      </div>
    </div>
  );
}

export default PlaceDetails;