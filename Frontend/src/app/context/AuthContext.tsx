import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '../services/api';
import { useAuthStore } from '../stores/authStore';

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
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'unicrew.auth.user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

function readStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    if (!parsed?.id || !parsed?.email || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const setStoreUser = useAuthStore((state) => state.setUser);
  const setStoreLoading = useAuthStore((state) => state.setLoading);

  const login = async (email: string, password: string) => {
    try {
      const authenticated = await authService.login(email, password);
      const authenticatedUser: User = {
        id: authenticated._id || authenticated.id,
        name: authenticated.name,
        email: authenticated.email,
        role: authenticated.role,
        university: authenticated.university || undefined,
        universityId: authenticated.universityId || undefined,
        studentId: authenticated.studentId || undefined,
        degree: authenticated.degree || undefined,
        year: authenticated.year || undefined,
        linkedin: authenticated.linkedin || undefined,
        github: authenticated.github || undefined,
        avatar: authenticated.avatar || undefined,
        skills: authenticated.skills || [],
        about: authenticated.about || '',
      } as User;

      setUser(authenticatedUser);
      setStoreUser({ ...(authenticated as any), _id: authenticatedUser.id } as any);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
      return { success: true, role: authenticatedUser.role };
    } catch (_error) {
      return { success: false, error: 'Cannot reach server. Please try again.' };
    }
  };

  const register = async (userData: Partial<User>) => {
    const registered = await authService.register(userData as any);
    const newUser: User = {
      id: registered._id || registered.id,
      name: registered.name,
      email: registered.email,
      role: registered.role || 'student',
      studentId: registered.studentId,
      university: registered.university,
      degree: registered.degree,
      year: registered.year,
      linkedin: registered.linkedin,
      github: registered.github,
      avatar: registered.avatar,
      skills: registered.skills || [],
      about: registered.about || '',
    } as User;
    setUser(newUser);
    setStoreUser({ ...(registered as any), _id: newUser.id } as any);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    authService.logout().catch(() => undefined);
    setUser(null);
    setStoreUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (user) {
      const updated = await authService.updateProfile(userData as any);
      const updatedUser = { ...user, ...updated, id: updated._id || user.id };
      setUser(updatedUser);
      setStoreUser(updated as any);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      setStoreLoading(true);
      try {
        const me = await authService.getMe();
        const mappedUser: User = {
          id: me._id || me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          studentId: me.studentId,
          university: me.university,
          universityId: me.universityId,
          degree: me.degree,
          year: me.year,
          linkedin: me.linkedin,
          github: me.github,
          avatar: me.avatar,
          skills: me.skills || [],
          about: me.about || '',
        };
        setUser(mappedUser);
        setStoreUser(me);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mappedUser));
      } catch {
        setUser(null);
        setStoreUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setStoreLoading(false);
      }
    };

    bootstrapAuth();
  }, [setStoreLoading, setStoreUser]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
