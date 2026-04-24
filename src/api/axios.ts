import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (refreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    refreshing = true;

    try {
      const res = await api.post<{ access_token: string }>("/auth/refresh");
      const newToken = res.data.access_token;
      useAuthStore.getState().setUser(useAuthStore.getState().user!, newToken);
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
      return Promise.reject(error);
    } finally {
      refreshing = false;
    }
  }
);

export default api;
