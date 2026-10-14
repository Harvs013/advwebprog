import api from './api';

const USER_KEY = 'bulatao_user';
const TOKEN_KEY = 'bulatao_token';

function persistSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export const authService = {
  async signUp({ firstName, lastName, email, password, role }) {
    const { token, user } = await api.post('/users', { firstName, lastName, email, password, role });
    return persistSession({ token, user });
  },

  async logIn({ email, password }) {
    const { token, user } = await api.post('/users/login', { email, password });
    return persistSession({ token, user });
  },

  logOut() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    // A stale or manually edited value should not prevent React from mounting.
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  updateStoredUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

export default authService;
