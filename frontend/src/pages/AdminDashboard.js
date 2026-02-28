import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import ticketService from '../services/ticketService';
import refundService from '../services/refundService';
import placeService from '../services/placeService';
import { formatCurrency } from '../utils/constants';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPlaces: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingRefunds: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [placesRes, bookingsRes, paymentsRes, refundsRes] = await Promise.all([
        placeService.getAllPlaces(),
        bookingService.getAllBookingsForAdmin(),
        paymentService.getAllPayments(),
        refundService.getAllRefunds()
      ]);

      const places = placesRes.data || [];
      const bookings = bookingsRes || [];
      const payments = paymentsRes.data || [];
      const refunds = refundsRes.data || [];

      const totalRevenue = payments
        .filter(p => p.paymentStatus === 'SUCCESS')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const pendingRefunds = refunds.filter(r => r.refundStatus === 'PENDING').length;

      setStats({
        totalPlaces: places.length,
        totalBookings: bookings.length,
        totalRevenue,
        pendingRefunds
      });

      setRecentBookings(bookings.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-content">
              <h3>Total Places</h3>
              <p className="stat-value">{stats.totalPlaces}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>Total Bookings</h3>
              <p className="stat-value">{stats.totalBookings}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <h3>Pending Refunds</h3>
              <p className="stat-value">{stats.pendingRefunds}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recent Bookings</h2>
          {recentBookings.length > 0 ? (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Place</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(booking => (
                    <tr key={booking.bookingId}>
                      <td>#{booking.bookingId}</td>
                      <td>{booking.place?.name}</td>
                      <td>{booking.user?.name}</td>
                      <td>{formatCurrency(booking.totalAmount)}</td>
                      <td>
                        <span className={`badge status-${booking.bookingStatus.toLowerCase()}`}>
                          {booking.bookingStatus}
                        </span>
                      </td>
                      <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No recent bookings</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
