import { createClient } from '@supabase/supabase-js';

// Kredensial default Supabase proyek Sumber Tehnik Dua
export const DEFAULT_SUPABASE_URL = 'https://qdmpvbdriavzhitxwxvm.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Rn8r228kkoSA5sTDyy6shg_N6itSC7F';

const getSavedConfig = () => {
  try {
    const url =
      (import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
      localStorage.getItem('sumber_tekhnik_supabase_url') ||
      DEFAULT_SUPABASE_URL;

    const anonKey =
      (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
      localStorage.getItem('sumber_tekhnik_supabase_anon_key') ||
      DEFAULT_SUPABASE_ANON_KEY;

    return { url: url.trim(), anonKey: anonKey.trim() };
  } catch {
    return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY };
  }
};

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSavedConfig();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 10 } }
    })
  : null;
