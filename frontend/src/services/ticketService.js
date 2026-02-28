import api from './api';

const ticketService = {
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  getAllTickets: () => api.get('/tickets'),
  getTicketById: (id) => api.get(`/tickets/${id}`),
  getTicketsByDate: (date) => api.get(`/tickets/date/${date}`),
  updateTicket: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  cancelTicket: (id) => api.put(`/tickets/cancel/${id}`),
  markAsUsed: (id) => api.put(`/tickets/used/${id}`),
  deleteTicket: (id) => api.delete(`/tickets/${id}`)
};

export default ticketService;
