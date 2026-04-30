export const APP_NAME = "DBDle";
export const MODE = "classic";
export const MAX_GUESSES = 6;
export const DAILY_ANCHOR_DATE = "2024-01-01";
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || "",
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
};
export const STORAGE_KEYS = {
  state: (dateKey) => `dbdle:${MODE}:${dateKey}`,
  stats: "dbdle:stats",
};
export const DATA_URLS = {
  characters: "/data/characters.json",
};