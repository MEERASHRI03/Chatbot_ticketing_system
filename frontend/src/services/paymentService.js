import api from './api';

const paymentService = {
  createPayment: (paymentData) => api.post('/payments', paymentData),
  getAllPayments: () => api.get('/payments'),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  getPaymentsByUser: (userId) => api.get(`/payments/user/${userId}`),
  updatePayment: (id, paymentData) => api.put(`/payments/${id}`, paymentData),
  deletePayment: (id) => api.delete(`/payments/${id}`)
};

export default paymentService;
