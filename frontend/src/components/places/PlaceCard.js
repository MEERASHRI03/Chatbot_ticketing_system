import { Link } from "react-router-dom";
import "../../styles/cards.css";

function PlaceCard({ place, gradient, emoji, index }) {
  return (
    <div
      className="pc-card"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Visual banner */}
      <div className="pc-banner" style={{ background: gradient }}>
        <div className="pc-emoji">{emoji}</div>
        <div className="pc-banner-overlay" />
        <div className="pc-location-tag">
          📍 {place.city}, {place.state}
        </div>
      </div>

      {/* Body */}
      <div className="pc-body">
        <h3 className="pc-name">{place.name}</h3>

        <div className="pc-prices">
          <div className="pc-price-item">
            <span className="pc-price-label">Adult</span>
            <span className="pc-price-val">₹{place.adultPrice}</span>
          </div>
          <div className="pc-price-divider" />
          <div className="pc-price-item">
            <span className="pc-price-label">Child</span>
            <span className="pc-price-val">₹{place.childPrice}</span>
          </div>
        </div>

        <div className="pc-actions">
          <Link to={`/place/${place.placeId}`} className="pc-btn-outline">
            View Details
          </Link>
          <Link to={`/booking/${place.placeId}`} className="pc-btn-fill">
            Book Now →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PlaceCard;