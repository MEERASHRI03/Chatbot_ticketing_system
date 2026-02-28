import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-container">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Travel Booking System</h1>
            <p>Discover amazing destinations and book your tickets with ease</p>
            {isAuthenticated ? (
              <button onClick={() => navigate('/places')} className="btn btn-primary btn-lg">
                Browse Destinations
              </button>
            ) : (
              <div className="hero-buttons">
                <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg">
                  Login
                </button>
                <button onClick={() => navigate('/register')} className="btn btn-secondary btn-lg">
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎫</div>
              <h3>Easy Booking</h3>
              <p>Book tickets to your favorite destinations in just a few clicks</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Secure Payment</h3>
              <p>Safe and secure payment methods for your peace of mind</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Digital Tickets</h3>
              <p>Get your tickets instantly with QR codes</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Easy Refunds</h3>
              <p>Request refunds easily if your plans change</p>
            </div>
          </div>
        </div>
      </section>

      {isAuthenticated && (
        <section className="quick-actions">
          <div className="container">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <div className="action-card" onClick={() => navigate('/places')}>
                <div className="action-icon">🏨</div>
                <h3>Browse Places</h3>
              </div>

              <div className="action-card" onClick={() => navigate('/my-bookings')}>
                <div className="action-icon">📅</div>
                <h3>My Bookings</h3>
              </div>

              <div className="action-card" onClick={() => navigate('/my-tickets')}>
                <div className="action-icon">🎟️</div>
                <h3>My Tickets</h3>
              </div>

              {user?.role === 'ADMIN' && (
                <div className="action-card" onClick={() => navigate('/admin/dashboard')}>
                  <div className="action-icon">⚙️</div>
                  <h3>Admin Panel</h3>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
