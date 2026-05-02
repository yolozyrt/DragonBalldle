import localCharacters from "../../data/characters.json";
import { DATA_URLS, SUPABASE_CONFIG } from "../config.js";

let charactersPromise = null;

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
  const response = await fetch(queryUrl, {
    headers: {
      apikey: SUPABASE_CONFIG.anonKey,
      Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase characters request failed with status ${response.status}`);
  }

  const records = await response.json();
  return records.map(mapSupabaseCharacter);
}

export async function loadCharacters() {
  if (!charactersPromise) {
    const hasSupabaseConfig = Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);

    charactersPromise = hasSupabaseConfig
      ? loadCharactersFromSupabase().catch(() => localCharacters)
      : fetch(DATA_URLS.characters, { cache: "no-store" })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Unable to load characters dataset");
            }

            return response.json();
          })
          .catch(() => localCharacters);
  }

  return charactersPromise;
}