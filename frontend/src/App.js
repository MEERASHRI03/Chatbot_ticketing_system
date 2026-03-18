import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Home from "./pages/user/Home";
import Places from "./components/places/Places";
import PlaceDetails from "./components/places/PlaceDetails";
import BookingPage from "./pages/booking/BookingPage";
import MyBookings from "./pages/user/MyBookings";
import TicketPage from "./pages/user/TicketPage";
import RefundTracking from "./pages/user/RefundTracking";

import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

import "./styles/global.css";

// Separated so useLocation works inside BrowserRouter
function AppLayout() {
  const location = useLocation();

  // Hide Navbar on these public pages
  const hideNavbarRoutes = ["/", "/login", "/signup"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/places" element={<ProtectedRoute><Places /></ProtectedRoute>} />
        <Route path="/place/:id" element={<ProtectedRoute><PlaceDetails /></ProtectedRoute>} />
        <Route path="/booking/:placeId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/ticket" element={<TicketPage />} />
        <Route path="/ticket/:bookingId" element={<TicketPage />} />
        <Route path="/refund/:ticketId" element={<RefundTracking />} />

      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;