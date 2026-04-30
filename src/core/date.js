export function pad(value) {
  return String(value).padStart(2, "0");
}

export function toUtcDateKey(date = new Date()) {
  return [date.getUTCFullYear(), pad(date.getUTCMonth() + 1), pad(date.getUTCDate())].join("-");
}

export function dayIndexFromAnchor(dateKey, anchorDateKey) {
  const current = Date.parse(`${dateKey}T00:00:00.000Z`);
  const anchor = Date.parse(`${anchorDateKey}T00:00:00.000Z`);
  return Math.floor((current - anchor) / 86400000);
}