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