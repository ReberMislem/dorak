// ============================================
// دورك - API Service Base
// ============================================

import axios from "axios";
import type { LoginCredentials, RegisterData } from "@/types";
import type { CreateQueueInput, UpdateQueueInput } from "@/lib/validations";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || "حدث خطأ غير متوقع";
    return Promise.reject(new Error(message));
  }
);

export default api;

export const authService = {
  login: (data: LoginCredentials) => api.post("/auth/login", data),
  register: (data: RegisterData) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
};

export const queueService = {
  getAll: () => api.get("/queues"),
  getById: (id: string) => api.get(`/queues/${id}`),
  create: (data: CreateQueueInput) => api.post("/queues", data),
  update: (id: string, data: UpdateQueueInput) => api.patch(`/queues/${id}`, data),
  callNext: (id: string) => api.post(`/queues/${id}/call-next`),
};
