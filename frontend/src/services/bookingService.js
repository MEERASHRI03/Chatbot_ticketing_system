import axiosInstance from "../api/axiosConfig";

export const createBooking = (bookingData) => {
  return axiosInstance.post("/api/bookings", bookingData);
};

export const getMyBookings = (userId) => {
  return axiosInstance.get(`/api/bookings/my?userId=${userId}`);
};

export const getBookingById = (id) => {
  return axiosInstance.get(`/api/bookings/${id}`);
};

// ✅ Fixed endpoint
export const getUserBookings = (userId) => {
  return axiosInstance.get(`/api/bookings/user/${userId}`);
};

export const cancelBooking = (bookingId) => {
  return axiosInstance.delete(`/api/bookings/${bookingId}`);
};