import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Places from './pages/Places';
import PlaceDetail from './pages/PlaceDetail';
import BookingDetail from './pages/BookingDetail';
import MyBookings from './pages/MyBookings';
import MyTickets from './pages/MyTickets';
import AdminDashboard from './pages/AdminDashboard';
import ManagePlaces from './pages/ManagePlaces';
import ManageRefunds from './pages/ManageRefunds';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Routes */}
          <Route 
            path="/places" 
            element={
              <PrivateRoute>
                <Places />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/place/:placeId" 
            element={
              <PrivateRoute>
                <PlaceDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/booking/:bookingId" 
            element={
              <PrivateRoute>
                <BookingDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/my-bookings" 
            element={
              <PrivateRoute>
                <MyBookings />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/my-tickets" 
            element={
              <PrivateRoute>
                <MyTickets />
              </PrivateRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <PrivateRoute adminOnly={true}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/places" 
            element={
              <PrivateRoute adminOnly={true}>
                <ManagePlaces />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/refunds" 
            element={
              <PrivateRoute adminOnly={true}>
                <ManageRefunds />
              </PrivateRoute>
            } 
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
