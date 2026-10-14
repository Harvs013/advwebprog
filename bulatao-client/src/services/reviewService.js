import api from './api';

export const reviewService = {
  create: (review) => api.post('/reviews', review),
  getAll: () => api.get('/reviews'),                     // admin — every review
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  getByUser: (userId) => api.get(`/reviews/user/${userId}`),
  update: (id, updates) => api.put(`/reviews/${id}`, updates),
  remove: (id) => api.delete(`/reviews/${id}`),
};

export default reviewService;