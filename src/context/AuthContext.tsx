import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

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
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];

    // Special check for admin email
    const isAdmin = cleanEmail === 'admin@gmail.com';
    const role: 'admin' | 'user' = isAdmin ? 'admin' : 'user';

    const googleUser: UserProfile = {
      id: isAdmin ? 'admin-01' : 'usr-' + Date.now().toString(36),
      name: isAdmin ? 'Admin Sumber Tehnik' : cleanName,
      email: cleanEmail,
      role,
      provider: 'google'
    };

    if (supabase) {
      try {
        await supabase.from('users').upsert({
          id: googleUser.id,
          nama: googleUser.name,
          email: cleanEmail,
          password: isAdmin ? '1234' : 'google-auth',
          role,
          created_at: Date.now()
        }, { onConflict: 'email' });
      } catch (err) {
        console.warn('Upsert google user to Supabase error:', err);
      }
    }

    setUser(googleUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(googleUser));
    setLoading(false);
    return true;
  };

  const loginWithEmail = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password?.trim() || '';

    // 1. Cek Akun Resmi Admin (admin@gmail.com / 1234)
    if (cleanEmail === 'admin@gmail.com' && cleanPass === '1234') {
      const adminUser: UserProfile = {
        id: 'admin-01',
        name: 'Admin Sumber Tehnik',
        email: 'admin@gmail.com',
        role: 'admin',
        provider: 'local'
      };

      // Pastikan tercatat juga di tabel Supabase
      if (supabase) {
        try {
          await supabase.from('users').upsert({
            id: 'admin-01',
            nama: 'Admin Sumber Tehnik',
            email: 'admin@gmail.com',
            password: '1234',
            role: 'admin',
            created_at: 1794489000000
          }, { onConflict: 'email' });
        } catch (e) {
          console.warn('Sync admin to Supabase:', e);
        }
      }

      setUser(adminUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
      return { success: true };
    }

    // 2. Cek Akun Pengguna / User di Tabel Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (!error && data) {
          if (data.password !== cleanPass) {
            return { success: false, message: 'Password salah.' };
          }

          const loggedInUser: UserProfile = {
            id: data.id,
            name: data.nama,
            email: data.email,
            role: data.role === 'admin' ? 'admin' : 'user',
            provider: 'local'
          };

          setUser(loggedInUser);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedInUser));
          return { success: true };
        }
      } catch (err) {
        console.warn('Error query user from Supabase:', err);
      }
    }

    // 3. Fallback Local Storage
    const users = getRegisteredUsers();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, message: 'Akun belum terdaftar. Silakan registrasi terlebih dahulu.' };
    }

    if (cleanPass && found.password && found.password !== cleanPass) {
      return { success: false, message: 'Password salah.' };
    }

    setUser(found);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    return { success: true };
  };

  const registerUser = async (name: string, email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = password?.trim() || '';

    if (!cleanName || !cleanEmail) {
      return { success: false, message: 'Nama dan email wajib diisi.' };
    }

    if (cleanEmail === 'admin@gmail.com') {
      return { success: false, message: 'Email ini sudah terdaftar. Silakan langsung login.' };
    }

    const newId = 'usr-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const now = Date.now();

    // 1. Simpan ke Supabase tabel `users`
    if (supabase) {
      try {
        // Cek duplikasi email
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existing) {
          return { success: false, message: 'Email ini sudah terdaftar. Silakan langsung login.' };
        }

        const { error: insertError } = await supabase.from('users').insert({
          id: newId,
          nama: cleanName,
          email: cleanEmail,
          password: cleanPass,
          role: 'user',
          created_at: now
        });

        if (insertError) {
          console.error('Supabase register error:', insertError);
          if (insertError.message.includes('unique') || insertError.code === '23505') {
            return { success: false, message: 'Email ini sudah terdaftar. Silakan langsung login.' };
          }
        }
      } catch (err) {
        console.warn('Register to Supabase error:', err);
      }
    }

    // 2. Simpan juga ke cache lokal
    const localUsers = getRegisteredUsers();
    if (localUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Email ini sudah terdaftar. Silakan langsung login.' };
    }

    const newUser: UserProfile = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role: 'user',
      provider: 'local'
    };

    localUsers.push(newUser);
    saveRegisteredUsers(localUsers);

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
