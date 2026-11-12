import { createClient } from '@supabase/supabase-js';

// Baca dari environment variable Vercel atau dari pengaturan tersimpan di browser
const getSavedConfig = () => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('sumber_tekhnik_supabase_url') || '';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('sumber_tekhnik_supabase_anon_key') || '';
    return { url, anonKey };
  } catch {
    return { url: '', anonKey: '' };
  }
};

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSavedConfig();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
      realtime: { params: { eventsPerSecond: 10 } }
    })
  : null;

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('sumber_tekhnik_supabase_url', url.trim());
  localStorage.setItem('sumber_tekhnik_supabase_anon_key', anonKey.trim());
  window.location.reload();
};
