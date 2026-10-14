import api from './api';

const buildQuery = (params = {}) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return query ? `?${query}` : '';
};

const withImageFile = (data, imageFile) => {
  if (!imageFile) return data;

  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'images' && value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
  formData.append('image', imageFile);
  return formData;
};

const productService = {
  getAll(params) {
    return api.get(`/products${buildQuery(params)}`).then((data) => data.products ?? data);
  },
  getById(id) {
    return api.get(`/products/${id}`);
  },
  uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/products/upload', formData);
  },
  create(data, imageFile) {
    return api.post('/products', withImageFile(data, imageFile));
  },
  update(id, data, imageFile) {
    return api.put(`/products/${id}`, withImageFile(data, imageFile));
  },
  remove(id) {
    return api.delete(`/products/${id}`);
  },
};

export default productService;