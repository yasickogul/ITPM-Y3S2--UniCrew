import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type UserRole = 'student' | 'university_admin' | 'system_admin' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  university?: string;
  degree?: string;
  year?: string;
  linkedin?: string;
  github?: string;
  avatar?: string;
  skills?: string[];
  about?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  register: (userData: Partial<User>) => void;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';
const AUTH_STORAGE_KEY = 'unicrew.auth.user';
const AUTH_TOKEN_KEY = 'unicrew.auth.token';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        return { success: false, error: payload.message || 'Invalid email or password' };
      }

      const authenticatedUser: User = {
        id: payload.data.user.id,
        name: payload.data.user.name,
        email: payload.data.user.email,
        role: payload.data.user.role,
        university: payload.data.user.university || undefined,
      };

      setUser(authenticatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      localStorage.setItem(AUTH_TOKEN_KEY, payload.data.token);
      return { success: true, role: authenticatedUser.role };
    } catch (_error) {
      return { success: false, error: 'Cannot reach server. Please try again.' };
    }
  };

  const register = (userData: Partial<User>) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      role: 'student',
      studentId: userData.studentId,
      university: userData.university,
      degree: userData.degree,
      year: userData.year,
      linkedin: userData.linkedin,
      github: userData.github,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
      skills: [],
      about: '',
    };
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
