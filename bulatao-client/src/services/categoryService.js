import api from './api';

export const categoryService = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (category) => api.post('/categories', category),
  update: (id, updates) => api.put(`/categories/${id}`, updates),
  remove: (id) => api.delete(`/categories/${id}`),
};

export default categoryService;