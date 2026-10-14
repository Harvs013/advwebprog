import api from './api';

export const userService = {
  getAll: () => api.get('/users'),                              // admin
  getById: (id) => api.get(`/users/${id}`),                      // owner or admin
  update: (id, updates) => api.put(`/users/${id}`, updates),     // owner or admin — profile edit
  changePassword: (id, payload) => api.put(`/users/${id}/password`, payload), // owner
  setActive: (id, isActive) => api.put(`/users/${id}/status`, { isActive }),  // admin
  remove: (id) => api.delete(`/users/${id}`),                     // admin
};

export default userService;