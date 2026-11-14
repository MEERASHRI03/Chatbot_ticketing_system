import axiosInstance from "../api/axiosConfig";

// Create booking from chatbot
export const createChatbotBooking = (bookingData) => {
  return axiosInstance.post("/api/bookings", bookingData);
};

// Fetch ticket after booking
export const getTicketByBooking = (bookingId) => {
  return axiosInstance.get(`/api/tickets/booking/${bookingId}`);
};

// Create payment record
export const createChatbotPayment = (paymentData) => {
  return axiosInstance.post("/api/payments", paymentData);
};

// Get all places for selection
export const getChatbotPlaces = () => {
  return axiosInstance.get("/places");
};
