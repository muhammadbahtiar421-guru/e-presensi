import { createClient } from '@supabase/supabase-js';

// Mengambil URL dan Key dari file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Validasi agar tidak error jika .env belum diisi
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL atau Key belum diset di file .env!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);