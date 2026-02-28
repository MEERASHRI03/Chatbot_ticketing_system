import api from './api';

const bookingService = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getAllBookings: () => api.get('/bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getBookingsByUser: (userId) => api.get(`/bookings/user/${userId}`),
  getMyBookings: (userId) => api.get(`/bookings/my`, { params: { userId } }),
  getAllBookingsForAdmin: () => api.get('/bookings/admin'),
  updateBooking: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  cancelBooking: (id) => api.put(`/bookings/cancel/${id}`),
  deleteBooking: (id) => api.delete(`/bookings/${id}`)
};

export default bookingService;
