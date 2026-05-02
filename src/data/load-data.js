import { SUPABASE_CONFIG } from "../config.js";

let charactersPromise = null;

function isPlaceholderSupabaseUrl(url) {
  return /ton-projet\.supabase\.co|your-project-ref\.supabase\.co/i.test(url);
}

function toList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\s*,\s*|\s*\|\s*|\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
}

function mapSupabaseCharacter(record) {
  return {
    id: record.id,
    name: record.name,
    aliases: toList(record.aliases),
    race: record.race,
    sagas: toList(record.sagas),
    affiliations: toList(record.affiliations),
    alignment: record.alignment,
    firstAppearanceYear: toNumber(record.first_appearance_year),
    seriePremiereAppearance: record.serie_premiere_apparition ?? record.serie_premiere_appearance ?? null,
    episodePremiereAppearance: toNumber(record.episode_premiere_apparition ?? record.episode_premiere_appearance),
    image: record.image,
  };
}

async function loadCharactersFromSupabase() {
  const queryUrl = `${SUPABASE_CONFIG.url}/rest/v1/characters?select=*&order=name.asc`;
  let response;

  try {
    response = await fetch(queryUrl, {
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
      },
    });
  } catch {
    throw new Error(
      "Unable to reach Supabase. Check VITE_SUPABASE_URL and your network connection. The URL must be your real project URL.",
    );
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Supabase access denied. Check VITE_SUPABASE_ANON_KEY and table policies (RLS) for character.",
      );
    }

    throw new Error(`Supabase character request failed with status ${response.status}`);
  }

  const records = await response.json();
  return records.map(mapSupabaseCharacter);
}

export async function loadCharacters() {
  if (!charactersPromise) {
    const hasSupabaseConfig = Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
    if (!hasSupabaseConfig) {
      throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    }

    if (isPlaceholderSupabaseUrl(SUPABASE_CONFIG.url)) {
      throw new Error("VITE_SUPABASE_URL is still a placeholder. Replace it with your real Supabase project URL.");
    }

    charactersPromise = loadCharactersFromSupabase();
  }

  return charactersPromise;
}