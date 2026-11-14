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
import PaymentPage from "./pages/user/PaymentPage";     // ✅ fixed path
import ChatbotPage from "./pages/ChatbotPage";           // ✅ new chatbot page
import AdminPlaces from "./pages/admin/AdminPlaces";     // ✅ Admin places management

import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

import "./styles/global.css";
import "./styles/chatbot.css";
import "./styles/payment.css";

import { ChatbotProvider } from "./context/ChatbotContext";
import ChatbotLauncher from "./components/chatbot/ChatbotLauncher";

function AppLayout() {
  const location = useLocation();

  const hideNavbarRoutes = ["/", "/login", "/signup", "/chatbot"];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <ChatbotProvider>                      {/* ✅ wraps everything so all children can use useChatbot() */}
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
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/ticket" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
        <Route path="/ticket/:bookingId" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
        <Route path="/refund/:ticketId" element={<ProtectedRoute><RefundTracking /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/admin/places" element={<ProtectedRoute><AdminPlaces /></ProtectedRoute>} />
        <Route path="/chatbot" element={<ChatbotPage />} />
      </Routes>

      <ChatbotLauncher />                  {/* ✅ inside provider so it can call useChatbot() */}
    </ChatbotProvider>
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