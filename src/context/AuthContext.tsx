import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithGoogle: (email: string, name?: string) => Promise<boolean>;
  loginWithEmail: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (name: string, email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'sumber_tekhnik_current_user';
const ALL_USERS_KEY = 'sumber_tekhnik_registered_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        // Do NOT auto-login as requested: start on login / register screen
        setUser(null);
      }
    } catch (e) {
      console.error('Error loading user session:', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRegisteredUsers = (): UserProfile[] => {
    try {
      const list = localStorage.getItem(ALL_USERS_KEY);
      return list ? JSON.parse(list) : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredUsers = (users: UserProfile[]) => {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  };

  const loginWithGoogle = async (email: string, name?: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];

    const users = getRegisteredUsers();
    let existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!existingUser) {
      existingUser = {
        id: 'usr-' + Date.now().toString(36),
        name: cleanName,
        email: cleanEmail,
        role: 'teknisi',
        provider: 'google'
      };
      users.push(existingUser);
      saveRegisteredUsers(users);
    }

    setUser(existingUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(existingUser));
    setLoading(false);
    return true;
  };

  const loginWithEmail = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const users = getRegisteredUsers();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, message: 'Akun belum terdaftar. Silakan registrasi terlebih dahulu.' };
    }

    if (password && found.password && found.password !== password) {
      return { success: false, message: 'Password salah.' };
    }

    setUser(found);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    return { success: true };
  };

  const registerUser = async (name: string, email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail) {
      return { success: false, message: 'Nama dan email wajib diisi.' };
    }

    const users = getRegisteredUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email Google ini sudah terdaftar. Silakan langsung login.' };
    }

    const newUser: UserProfile = {
      id: 'usr-' + Date.now().toString(36),
      name: cleanName,
      email: cleanEmail,
      password: password || '',
      role: 'teknisi',
      provider: 'google'
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerUser, logout }}>
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
