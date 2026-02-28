import api from './api';

const refundService = {
  requestRefund: (ticketId, reason) => api.post(`/refunds/request/${ticketId}`, null, { params: { reason } }),
  getAllRefunds: () => api.get('/refunds'),
  getRefundById: (id) => api.get(`/refunds/${id}`),
  approveRefund: (id) => api.put(`/refunds/approve/${id}`),
  rejectRefund: (id) => api.put(`/refunds/reject/${id}`),
  deleteRefund: (id) => api.delete(`/refunds/${id}`)
};

export default refundService;
