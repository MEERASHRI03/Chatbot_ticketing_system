import axiosInstance from "../api/axiosConfig";

// Get all refunds (ADMIN only)
export const getAllRefunds = () => {
  return axiosInstance.get("/api/refunds");
};

// Get refund by ID
export const getRefundById = (refundId) => {
  return axiosInstance.get(`/api/refunds/${refundId}`);
};

// Approve refund (ADMIN only)
export const approveRefund = (refundId) => {
  return axiosInstance.put(`/api/refunds/approve/${refundId}`);
};

// Reject refund (ADMIN only)
export const rejectRefund = (refundId) => {
  return axiosInstance.put(`/api/refunds/reject/${refundId}`);
};

// Delete refund (SUPER_ADMIN only - if needed)
export const deleteRefund = (refundId) => {
  return axiosInstance.delete(`/api/refunds/${refundId}`);
};

// Get refund by ticket ID
export const getRefundByTicketId = (ticketId) => {
  return axiosInstance.get(`/api/refunds/ticket/${ticketId}`);
};
