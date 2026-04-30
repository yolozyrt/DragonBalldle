import { normalizeText } from "./normalize.js";

function getTerms(character) {
  return [character.name, ...(character.aliases || [])].map(normalizeText);
}

export function searchCharacters(query, characters, limit = 8) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return [];
  }

  return characters
    .map((character) => {
      const normalizedName = normalizeText(character.name);
      const aliasMatch = (character.aliases || []).find((alias) => normalizeText(alias).includes(normalizedQuery));
      const nameMatch = normalizedName.includes(normalizedQuery);

      if (!nameMatch && !aliasMatch) {
        return null;
      }

      return {
        character,
        label: aliasMatch || character.name,
        score: nameMatch ? 0 : 1,
        terms: getTerms(character),
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.score - right.score || left.character.name.localeCompare(right.character.name))
    .slice(0, limit)
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