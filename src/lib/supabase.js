import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cek apakah konfigurasi valid dan bukan nilai default placeholder
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚡ Supabase belum dikonfigurasi. Masukkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env Anda. Totools berjalan dalam Mode Tamu (Guest).'
  );
}

// Inisialisasi client Supabase (atau fallback dummy client jika belum diisi)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ error: new Error('Supabase belum dikonfigurasi di file .env') }),
        signUp: async () => ({ error: new Error('Supabase belum dikonfigurasi di file .env') }),
        signInWithOAuth: async () => ({ error: new Error('Supabase belum dikonfigurasi di file .env') }),
        signOut: async () => ({ error: null })
      },
      from: () => ({
        select: () => ({ data: [], error: null, order: () => ({ data: [], error: null }) }),
        insert: async () => ({ error: null }),
        delete: async () => ({ error: null }),
        upsert: async () => ({ error: null })
      })
    };
