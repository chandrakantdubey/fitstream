import { create } from 'zustand';

const getValidToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  } catch {
    localStorage.removeItem('token');
    return null;
  }
};

const initialToken = getValidToken();

const useAuthStore = create((set, get) => ({
  user: null,
  token: initialToken,
  isAuthenticated: !!initialToken,

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
    const token = getValidToken();
    set({ token, isAuthenticated: !!token });
  },
}));

export default useAuthStore;
