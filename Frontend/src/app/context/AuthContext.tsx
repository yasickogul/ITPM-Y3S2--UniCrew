import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  login: (email: string, password: string, role?: UserRole) => void;
  register: (userData: Partial<User>) => void;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const syncUserToLocalStorage = (nextUser: User | null) => {
    if (!nextUser) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userUniversity');
      localStorage.removeItem('userRole');
      return;
    }

    localStorage.setItem('userId', nextUser.id || '');
    localStorage.setItem('userName', nextUser.studentId || nextUser.name || 'Student');
    localStorage.setItem('userUniversity', nextUser.university || 'default-university');
    localStorage.setItem('userRole', nextUser.role || 'student');
  };

  const login = (email: string, password: string, role: UserRole = 'student') => {
    // Mock login - in real app, this would call an API
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email,
      role,
      studentId: 'STU2024001',
      university: 'Harvard University',
      degree: 'Computer Science',
      year: '3',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      skills: ['React', 'TypeScript', 'Node.js', 'Python'],
      about: 'Passionate about building innovative solutions and collaborating with fellow students.',
    };
    setUser(mockUser);
    syncUserToLocalStorage(mockUser);
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
    syncUserToLocalStorage(newUser);
  };

  const logout = () => {
    setUser(null);
    syncUserToLocalStorage(null);
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      syncUserToLocalStorage(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
