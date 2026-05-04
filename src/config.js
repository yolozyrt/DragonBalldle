export const APP_NAME = "DBDle";
export const DEFAULT_MODE = "classic";
export const MAX_GUESSES = 10;
export const DAILY_ANCHOR_DATE = "2024-01-01";
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || "",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
};
export const STORAGE_KEYS = {
  state: (mode, key) => `dbdle:${mode}:${key}`,
  stats: (mode) => (mode === DEFAULT_MODE ? "dbdle:stats" : `dbdle:${mode}:stats`),
};
