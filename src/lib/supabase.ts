import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ldmzlabnvcanmufwtuhr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z6mMKyOkrNLtPxzbalSRPQ_Is2QEi6z';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your environment configuration.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    db: {
      schema: 'insilico',
    },
  }
);
