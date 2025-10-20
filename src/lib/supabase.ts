import { createClient } from '@supabase/supabase-js';

// Create client even if credentials are missing (will error at runtime when used)
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

