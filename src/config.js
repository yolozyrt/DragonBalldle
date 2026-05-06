export const APP_NAME = "DBDle";
export const DEFAULT_MODE = "classic";
export const MAX_GUESSES = 10;
export const DAILY_ANCHOR_DATE = "2024-01-01";
const env = import.meta.env ?? {};
const fallbackSupabaseConfig = {
  url: "https://anbphwgszigjlewhhxsj.supabase.co",
  anonKey: "sb_publishable_ws8iAXg9V_ke1Z6UaMMk4w_0kwF3-s9",
};
export const SUPABASE_CONFIG = {
  url: env.VITE_SUPABASE_URL || fallbackSupabaseConfig.url,
  anonKey: env.VITE_SUPABASE_ANON_KEY || fallbackSupabaseConfig.anonKey,
};
export const STORAGE_KEYS = {
  state: (mode, key) => `dbdle:${mode}:${key}`,
  stats: (mode) => (mode === DEFAULT_MODE ? "dbdle:stats" : `dbdle:${mode}:stats`),
};
