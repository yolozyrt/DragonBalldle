import { normalizeText } from "./normalize.js";

function getTerms(character) {
  return [character.name, ...(character.aliases || [])].map(normalizeText);
}

function startsWithWord(term, query) {
  return term.split(/\s+/).some((word) => word.startsWith(query));
}

export function searchCharacters(query, characters, limit = 8) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return [];
  }

  // Single-letter search is very broad; raise the cap to avoid hiding expected names.
  const effectiveLimit = normalizedQuery.length <= 1 ? Math.max(limit, 20) : limit;

  return characters
    .map((character) => {
      const normalizedName = normalizeText(character.name);
      const normalizedAliases = (character.aliases || []).map(normalizeText);
      const aliasMatch = normalizedAliases.find((alias) => alias.includes(normalizedQuery));
      const nameMatch = normalizedName.includes(normalizedQuery);

      if (!nameMatch && !aliasMatch) {
        return null;
      }

      // Prioritize prefix and word-start matches before generic includes.
      let score = 4;
      if (normalizedName === normalizedQuery) {
        score = 0;
      } else if (normalizedName.startsWith(normalizedQuery)) {
        score = 1;
      } else if (startsWithWord(normalizedName, normalizedQuery)) {
        score = 2;
      } else if (nameMatch) {
        score = 3;
      }

      if (score > 1) {
        const aliasStartsWith = normalizedAliases.some((alias) => alias.startsWith(normalizedQuery));
        const aliasWordStartsWith = normalizedAliases.some((alias) => startsWithWord(alias, normalizedQuery));
        if (aliasStartsWith) {
          score = 1;
        } else if (aliasWordStartsWith) {
          score = 2;
        }
      }

      return {
        character,
        label: aliasMatch || character.name,
        score,
        terms: getTerms(character),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.score - right.score || left.character.name.localeCompare(right.character.name))
    .slice(0, effectiveLimit)
    .map(({ character, label }) => ({ character, label }));
}

export function findCharacterByQuery(query, characters) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return null;
  }

  return (
    characters.find((character) => getTerms(character).includes(normalizedQuery)) ||
    characters.find((character) => normalizeText(character.name) === normalizedQuery) ||
    null
  );
}