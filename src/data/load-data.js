import { SUPABASE_CONFIG } from "../config.js";

let charactersPromise = null;

function isPlaceholderSupabaseUrl(url) {
  return /ton-projet\.supabase\.co|your-project-ref\.supabase\.co/i.test(url);
}

function mapSupabaseCharacter(record) {
  return {
    id: record.id,
    name: record.name,
    aliases: record.aliases || [],
    race: record.race,
    sagas: record.sagas || [],
    affiliations: record.affiliations || [],
    alignment: record.alignment,
    firstAppearanceYear: record.first_appearance_year,
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
        "Supabase access denied. Check VITE_SUPABASE_ANON_KEY and table policies (RLS) for characters.",
      );
    }

    throw new Error(`Supabase characters request failed with status ${response.status}`);
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