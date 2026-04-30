import { STORAGE_KEYS } from "../config.js";

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadClassicState(dateKey) {
  return loadJSON(STORAGE_KEYS.state(dateKey), null);
}

export function saveClassicState(dateKey, state) {
  saveJSON(STORAGE_KEYS.state(dateKey), state);
}

export function loadStats() {
  return loadJSON(STORAGE_KEYS.stats, { played: 0, wins: 0, streak: 0, bestStreak: 0 });
}

export function saveStats(stats) {
  saveJSON(STORAGE_KEYS.stats, stats);
}