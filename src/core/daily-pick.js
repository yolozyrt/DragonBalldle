import { DAILY_ANCHOR_DATE } from "../config.js";
import { dayIndexFromAnchor } from "./date.js";
import { hashString } from "./hash.js";

export function getDailyAnswer(dateKey, characters) {
  if (!characters.length) {
    throw new Error("characters must not be empty");
  }

  const dayIndex = dayIndexFromAnchor(dateKey, DAILY_ANCHOR_DATE);
  const seed = hashString(String(dayIndex));
  const index = seed % characters.length;
  return characters[index];
}

function randomIndex(length) {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % length;
  }

  return Math.floor(Math.random() * length);
}

export function getRandomAnswer(characters) {
  if (!characters.length) {
    throw new Error("characters must not be empty");
  }

  return characters[randomIndex(characters.length)];
}