// Cargar variables de entorno directamente desde process.env
export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  AI_GATEWAY_BASE_URL: process.env.AI_GATEWAY_BASE_URL || '',
  AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY || '',
};

