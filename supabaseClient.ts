
import { createClient } from '@supabase/supabase-js';

// Pastikan URL dan KEY ini sesuai dengan Dashboard Supabase Anda (Project Settings > API)
const SUPABASE_URL = 'https://gxlaurnrleqyguzludmo.supabase.co';

/**
 * PENTING: Ganti string di bawah ini dengan 'anon' 'public' key dari Supabase.
 * Kunci yang benar SELALU diawali dengan 'eyJ...'. 
 * Jika diawali 'sb_publishable', itu adalah kunci Stripe dan TIDAK AKAN bekerja.
 */
// Fixed: Cast window to any to access environment variables safely in TypeScript
const SUPABASE_KEY = (window as any).process?.env?.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
