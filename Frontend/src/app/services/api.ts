import axios from "axios";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh auth endpoints themselves
      if (
        originalRequest.url.includes("/auth/me") ||
        originalRequest.url.includes("/auth/login") ||
        originalRequest.url.includes("/auth/register") ||
        originalRequest.url.includes("/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        // Don't redirect - let the app handle auth state through Zustand
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string, role?: string) => {
    const response = await api.post("/auth/login", { email, password, role });
    return response.data.data.user;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    studentId?: string;
    degree?: string;
    year?: string;
    linkedin?: string;
    github?: string;
    university?: string;
    universityId?: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data.data.user;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data.data;
  },

  updateProfile: async (userData: Partial<{
    name: string;
    degree: string;
    year: string;
    linkedin: string;
    github: string;
    skills: string[];
    about: string;
  }>) => {
    const response = await api.put("/auth/profile", userData);
    return response.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data.data;
  },
};

export const universityService = {
  getAll: async () => {
    const response = await api.get("/universities");
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/universities/${id}`);
    return response.data.data;
  },
  create: async (data: { name: string; email: string; domain: string }) => {
    const response = await api.post("/universities", data);
    return response.data.data;
  },
  update: async (id: string, data: Partial<{ name: string; email: string; domain: string }>) => {
    const response = await api.put(`/universities/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/universities/${id}`);
    return response.data.data;
  },
};

export const communityService = {
  getAll: async (params?: { universityId?: string; faculty?: string; search?: string }) => {
    const response = await api.get("/communities", { params });
    return response.data.data;
  },
  getAllForAdmin: async (params?: { universityId?: string; faculty?: string; search?: string }) => {
    const response = await api.get("/communities/admin/all", { params });
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/communities/${id}`);
    return response.data.data;
  },
  getMyCommunities: async () => {
    const response = await api.get("/communities/my");
    return response.data.data;
  },
  create: async (data: {
    name: string;
    description: string;
    faculty: string;
    year?: string;
    banner?: string;
    universityId: string;
    universityName: string;
  }) => {
    const response = await api.post("/communities", data);
    return response.data.data;
  },
  update: async (id: string, data: Partial<{
    name: string;
    description: string;
    faculty: string;
    year: string;
    banner: string;
    isActive: boolean;
  }>) => {
    const response = await api.put(`/communities/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/communities/${id}`);
    return response.data.data;
  },
  join: async (id: string) => {
    const response = await api.post(`/communities/${id}/join`);
    return response.data.data;
  },
  leave: async (id: string) => {
    const response = await api.post(`/communities/${id}/leave`);
    return response.data.data;
  },
};

export const eventService = {
  getAll: async (params?: { communityId?: string; status?: string; search?: string }) => {
    const response = await api.get("/events", { params });
    return response.data.data;
  },
  getUpcoming: async () => {
    const response = await api.get("/events/upcoming");
    return response.data.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  },
  create: async (data: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    communityId: string;
    communityName: string;
    organizer: string;
    organizerId: string;
    googleFormUrl?: string;
  }) => {
    const response = await api.post("/events", data);
    return response.data.data;
  },
  update: async (id: string, data: Partial<{
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    googleFormUrl: string;
    status: string;
  }>) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data.data;
  },
  getPending: async () => {
    const response = await api.get("/events/admin/pending");
    return response.data.data;
  },
  approve: async (id: string) => {
    const response = await api.put(`/events/${id}/approve`);
    return response.data.data;
  },
  decline: async (id: string, reason: string) => {
    const response = await api.put(`/events/${id}/decline`, { reason });
    return response.data.data;
  },
};

export const adminService = {
  getUsers: async (params?: { universityId?: string; role?: string; search?: string }) => {
    const response = await api.get("/admin/users", { params });
    return response.data.data;
  },
  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data.data;
  },
  deactivateUser: async (id: string) => {
    const response = await api.put(`/admin/users/${id}/deactivate`);
    return response.data.data;
  },
  activateUser: async (id: string) => {
    const response = await api.put(`/admin/users/${id}/activate`);
    return response.data.data;
  },
  changeUserRole: async (id: string, role: string) => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return response.data.data;
  },
};

export default api;
