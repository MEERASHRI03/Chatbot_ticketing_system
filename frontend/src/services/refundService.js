import axiosInstance from "../api/axiosConfig";

// Get refund details by ticketId
export const getRefundByTicket = (ticketId) => {
  return axiosInstance.get(`/api/refunds/ticket/${ticketId}`);
};

// Admin actions (future admin dashboard)
export const approveRefund = (refundId) => {
  return axiosInstance.put(`/api/refunds/approve/${refundId}`);
};

export const rejectRefund = (refundId) => {
  return axiosInstance.put(`/api/refunds/reject/${refundId}`);
};