import { DEFAULT_MODE, STORAGE_KEYS } from "../config.js";

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

export function loadGameState(mode, stateKey) {
  return loadJSON(STORAGE_KEYS.state(mode, stateKey), null);
}

export function saveGameState(mode, stateKey, state) {
  saveJSON(STORAGE_KEYS.state(mode, stateKey), state);
}

export function loadStats(mode = DEFAULT_MODE) {
  return loadJSON(STORAGE_KEYS.stats(mode), { played: 0, wins: 0, streak: 0, bestStreak: 0 });
}

export function saveStats(mode, stats) {
  saveJSON(STORAGE_KEYS.stats(mode), stats);
}