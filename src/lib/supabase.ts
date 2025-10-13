import { createClient } from '@supabase/supabase-js';
import { fetch } from 'undici';
import { env } from './env';

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

// Create client even if credentials are missing (will error at runtime when used)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: fetch as any,
    }
  }
);

