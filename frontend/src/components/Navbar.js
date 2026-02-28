import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          ✈️ Travel Booking
        </Link>

        <div className="nav-menu">
          {isAuthenticated ? (
            <>
              <Link to="/places" className="nav-link">Browse Places</Link>
              <Link to="/my-bookings" className="nav-link">My Bookings</Link>
              <Link to="/my-tickets" className="nav-link">My Tickets</Link>
              
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className="nav-link admin-link">Admin</Link>
                  <Link to="/admin/places" className="nav-link">Manage Places</Link>
                  <Link to="/admin/refunds" className="nav-link">Manage Refunds</Link>
                </>
              )}

              <div className="user-menu">
                <span className="user-name">{user?.name}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
