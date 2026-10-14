import api from './api';

export const orderService = {
  create: (order) => api.post('/orders', order),
  // params can include { status } — matches orderController.js's getOrders filter.
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/orders${query ? `?${query}` : ''}`);
  },
  getByUser: (userId) => api.get(`/orders/user/${userId}`),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, statusUpdate) => api.put(`/orders/${id}/status`, statusUpdate),
  remove: (id) => api.delete(`/orders/${id}`),
};

export default orderService;