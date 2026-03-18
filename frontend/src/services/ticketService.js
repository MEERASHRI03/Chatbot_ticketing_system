import axios from "../api/axiosConfig";

// Get ticket by booking
export const getTicketByBooking = (bookingId) => {
  return axios.get(`/api/tickets/booking/${bookingId}`);
};

// Cancel ticket with reason
export const cancelTicket = (ticketId, reason) => {
  return axios.put(`/api/tickets/cancel/${ticketId}`, {
    reason: reason
  });
};