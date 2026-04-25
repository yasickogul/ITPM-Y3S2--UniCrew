import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
const API_URL = `${API_BASE_URL}/api`;
const ACCESS_TOKEN_KEY = "unicrew.auth.token";
const REFRESH_TOKEN_KEY = "unicrew.auth.refreshToken";

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const setAccessToken = (token?: string | null) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

const getRefreshToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const setRefreshToken = (token?: string | null) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
        const refreshResponse = await api.post(
          "/auth/refresh",
          {},
          {
            headers: getRefreshToken() ? { "x-refresh-token": getRefreshToken() } : undefined,
          }
        );
        setAccessToken(refreshResponse?.data?.data?.token);
        setRefreshToken(refreshResponse?.data?.data?.refreshToken);
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        setRefreshToken(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string, role?: string) => {
    const response = await api.post("/auth/login", { email, password, role });
    setAccessToken(response?.data?.data?.token);
    setRefreshToken(response?.data?.data?.refreshToken);
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
    setAccessToken(response?.data?.data?.token);
    setRefreshToken(response?.data?.data?.refreshToken);
    return response.data.data.user;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    setAccessToken(null);
    setRefreshToken(null);
    return response.data.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data.data;
  },
  getDashboard: async () => {
    const response = await api.get("/auth/dashboard");
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
  getPendingPosts: async () => {
    const response = await api.get("/admin/posts/pending");
    return response.data.data;
  },
  getReportedPosts: async () => {
    const response = await api.get("/admin/posts/reported");
    return response.data.data;
  },
  approvePost: async (id: string) => {
    const response = await api.put(`/admin/posts/${id}/approve`);
    return response.data.data;
  },
  rejectPost: async (id: string) => {
    const response = await api.put(`/admin/posts/${id}/reject`);
    return response.data.data;
  },
  dismissPostReport: async (id: string) => {
    const response = await api.put(`/admin/posts/${id}/dismiss-report`);
    return response.data.data;
  },
};

export const discussionService = {
  createDiscussion: async (payload: {
    title: string;
    content: string;
    communityId: string;
    communityName: string;
    category: string;
    images?: string[];
  }) => {
    const response = await api.post("/discussions", payload);
    return response.data;
  },
  getDiscussions: async (params?: Record<string, string | number>) => {
    const response = await api.get("/discussions", { params });
    return response.data;
  },
  getDiscussionById: async (id: string) => {
    const response = await api.get(`/discussions/${id}`);
    return response.data;
  },
  likeDiscussion: async (id: string) => {
    const response = await api.put(`/discussions/${id}/like`);
    return response.data;
  },
  addComment: async (id: string, content: string) => {
    const response = await api.post(`/discussions/${id}/comments`, { content });
    return response.data;
  },
};

export default api;
