import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ypqbzolleyovqwbyfobd.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_9y07kgbsxPFouUC30SMNBA_FRPucdJ3';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (isSupabaseConfigured) {
  console.log(`⚡ Connected to Supabase Cloud Database: ${supabaseUrl}`);
} else {
  console.log(`ℹ️ Supabase credentials not set, using SQLite fallback.`);
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
