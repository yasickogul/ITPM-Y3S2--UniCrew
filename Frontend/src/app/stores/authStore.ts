import { create } from "zustand";

export type UserRole = "student" | "university_admin" | "system_admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  university?: string;
  universityId?: string;
  degree?: string;
  year?: string;
  linkedin?: string;
  github?: string;
  avatar?: string;
  skills?: string[];
  about?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: UserRole | null;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string, role?: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  role: null,

  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    role: user?.role || null 
  }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...userData } as User });
    }
  },

  login: async (email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const { authService } = await import("../services/api");
      const response = await authService.login(email, password, role);
      set({ 
        user: response.data, 
        isAuthenticated: true, 
        isLoading: false,
        role: response.data.role 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Login failed", 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { authService } = await import("../services/api");
      const response = await authService.register(userData as any);
      set({ 
        user: response.data, 
        isAuthenticated: true, 
        isLoading: false,
        role: "student"
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Registration failed", 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const { authService } = await import("../services/api");
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        role: null 
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const { authService } = await import("../services/api");
      const response = await authService.getMe();
      set({ 
        user: response.data, 
        isAuthenticated: true, 
        isLoading: false,
        role: response.data.role
      });
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        role: null
      });
    }
  },
}));
