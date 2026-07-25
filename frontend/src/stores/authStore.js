import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),

  checkAuth: () => {
    const token = localStorage.getItem('token');
    set({ token, isAuthenticated: !!token });
  },
}));

export default useAuthStore;
