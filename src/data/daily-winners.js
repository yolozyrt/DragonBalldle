import { SUPABASE_CONFIG } from "../config.js";

function isPlaceholderSupabaseUrl(url) {
  return /ton-projet\.supabase\.co|your-project-ref\.supabase\.co/i.test(url);
}

function hasSupabaseConfig() {
  return Boolean(
    SUPABASE_CONFIG.url &&
      SUPABASE_CONFIG.anonKey &&
      !isPlaceholderSupabaseUrl(SUPABASE_CONFIG.url),
  );
}

export function isDailyWinnersConfigured() {
  return hasSupabaseConfig();
}

function parseErrorMessage(body, fallback) {
  if (!body || typeof body !== "object") {
    return fallback;
  }

  return body.message || body.error_description || body.error || fallback;
}

function toSafeCount(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    return null;
  }

  return number;
}

function parseCountPayload(payload) {
  if (typeof payload === "string") {
    return toSafeCount(payload);
  }

  if (typeof payload === "number") {
    return toSafeCount(payload);
  }

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload)) {
      if (!payload.length) {
        return 0;
      }

      const first = payload[0];
      if (typeof first === "number" || typeof first === "string") {
        return toSafeCount(first);
      }

      if (first && typeof first === "object") {
        if ("winner_count" in first) {
          return toSafeCount(first.winner_count);
        }

        if ("increment_daily_winner_count" in first) {
          return toSafeCount(first.increment_daily_winner_count);
        }
      }

      return null;
    }

    if ("winner_count" in payload) {
      return toSafeCount(payload.winner_count);
    }

    if ("increment_daily_winner_count" in payload) {
      return toSafeCount(payload.increment_daily_winner_count);
    }
  }

  return null;
}

async function fetchJson(endpoint, options) {
  let response;

  try {
    response = await fetch(endpoint, options);
  } catch {
    throw new Error("Impossible de joindre Supabase. Verifiez votre reseau et la configuration.");
  }

  let details = null;
  try {
    details = await response.json();
  } catch {
    details = null;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Acces refuse a la table daily_winner_stats. Verifiez les policies RLS.");
    }

    throw new Error(parseErrorMessage(details, `Requete Supabase en echec (HTTP ${response.status}).`));
  }

  return details;
}

function buildHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_CONFIG.anonKey,
    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
  };
}

export async function fetchDailyWinnerCount(dateKey) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/daily_winner_stats?select=winner_count&date_key=eq.${encodeURIComponent(dateKey)}&limit=1`;
  const payload = await fetchJson(endpoint, {
    method: "GET",
    headers: buildHeaders(),
  });

  return parseCountPayload(payload);
}

export async function incrementDailyWinnerCount(dateKey) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const endpoint = `${SUPABASE_CONFIG.url}/rest/v1/rpc/increment_daily_winner_count`;
  const payload = await fetchJson(endpoint, {
    method: "POST",
    headers: {
      ...buildHeaders(),
      Prefer: "return=representation",
    },
    body: JSON.stringify({ target_date: dateKey }),
  });

  return parseCountPayload(payload);
}
