import { normalizeText } from "../data/normalize.js";

function compareSimple(expected, guess) {
  return {
    status: normalizeText(expected) === normalizeText(guess) ? "exact" : "none",
    value: guess,
  };
}

function compareList(expected, guess) {
  const expectedSet = new Set(expected.map(normalizeText));
  const guessSet = new Set(guess.map(normalizeText));
  const overlap = guess.filter((item) => expectedSet.has(normalizeText(item)));
  const exact = expectedSet.size === guessSet.size && [...expectedSet].every((item) => guessSet.has(item));

  return {
    status: exact ? "exact" : overlap.length > 0 ? "partial" : "none",
    value: guess.join(", "),
    matchValues: overlap,
  };
}

function compareYear(expected, guess) {
  if (guess === expected) {
    return { status: "exact", value: guess };
  }

  return { status: guess < expected ? "higher" : "lower", value: guess };
}

export function compareGuess(guess, answer) {
  return {
    name: compareSimple(answer.name, guess.name),
    race: compareSimple(answer.race, guess.race),
    sagas: compareList(answer.sagas, guess.sagas),
    affiliations: compareList(answer.affiliations, guess.affiliations),
    alignment: compareSimple(answer.alignment, guess.alignment),
    firstAppearanceYear: compareYear(answer.firstAppearanceYear, guess.firstAppearanceYear),
  };
}