import api from './api';

export const cartService = {
  getByUser: (userId) => api.get(`/cart/${userId}`),
  addItem: ({ productId, quantity, price }) =>
    api.post('/cart/add', { productId, quantity, price }), // owner comes from the JWT
  removeItem: (userId, productId) => api.delete(`/cart/${userId}/item/${productId}`),
  clear: (userId) => api.delete(`/cart/${userId}/clear`),
};

export default cartService;