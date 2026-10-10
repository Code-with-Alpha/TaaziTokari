// Supabase Client Helper for Taazi Tokari
// Configures optional client connection if env variables VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY are present

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  anonKey: supabaseAnonKey ? '[CONFIGURED]' : '[MISSING]',
  status: isSupabaseConfigured ? 'CONNECTED' : 'FALLBACK_LOCAL_DATASTORE',
});
