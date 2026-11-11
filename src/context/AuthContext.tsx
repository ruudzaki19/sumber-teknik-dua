import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-google-ayah-01',
  name: 'Ayah (Teknisi AC)',
  email: 'ayah.sumbertekhnik@gmail.com',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  role: 'teknisi',
  provider: 'google'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sumber_tekhnik_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // By default on first visit, set the logged in technician user so the user can test immediately!
        // But also allow explicit logout/login
        setUser(DEFAULT_USER);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      }
    } catch (e) {
      console.error('Error loading user from localStorage:', e);
      setUser(DEFAULT_USER);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async (customEmail?: string, customName?: string) => {
    setLoading(true);
    // Simulate real Google OAuth handshake delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const email = customEmail?.trim() || 'ayah.sumbertekhnik@gmail.com';
    const name = customName?.trim() || (email.includes('@') ? email.split('@')[0] : 'Teknisi AC');

    const newUser: UserProfile = {
      id: 'usr-google-' + Math.random().toString(36).substring(2, 9),
      name: name,
      email: email,
      photoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1e40af`,
      role: 'teknisi',
      provider: 'google'
    };

    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updated };
    setUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
