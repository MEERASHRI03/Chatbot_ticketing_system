import axiosInstance from "../api/axiosConfig";

// Get all payments (ADMIN only)
export const getAllPayments = () => {
  return axiosInstance.get("/api/payments");
};

// Get payment by ID
export const getPaymentById = (paymentId) => {
  return axiosInstance.get(`/api/payments/${paymentId}`);
};

// Get payments by user ID
export const getPaymentsByUserId = (userId) => {
  return axiosInstance.get(`/api/payments/user/${userId}`);
};

// Update payment status (ADMIN only)
export const updatePayment = (paymentId, paymentData) => {
  return axiosInstance.put(`/api/payments/${paymentId}`, paymentData);
};

// Delete payment (SUPER_ADMIN only)
export const deletePayment = (paymentId) => {
  return axiosInstance.delete(`/api/payments/${paymentId}`);
};
