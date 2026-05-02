import { MAX_GUESSES } from "./config.js";
import { toUtcDateKey } from "./core/date.js";
import { getDailyAnswer } from "./core/daily-pick.js";
import { compareGuess } from "./core/compare.js";
import { loadClassicState, loadStats, saveClassicState, saveStats } from "./core/storage.js";
import { loadCharacters } from "./data/load-data.js";
import { findCharacterByQuery, searchCharacters } from "./data/search.js";
import { copyText, qs } from "./ui/dom.js";
import { renderClassic, renderPlaceholder } from "./ui/render.js";

const app = qs("#app");
const page = document.body.dataset.page || "classic";
const dateKey = toUtcDateKey(new Date());

function buildShareText({ status, rows }) {
  const outcome = status === "won" ? `${rows.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const clueRow = rows
    .map(({ comparison }) => {
      const saga = comparison.sagas.status === "exact" ? "S" : comparison.sagas.status === "partial" ? "s" : ".";
      const affiliation =
        comparison.affiliations.status === "exact" ? "A" : comparison.affiliations.status === "partial" ? "a" : ".";
      const year = comparison.firstAppearanceYear.status === "exact" ? "Y" : comparison.firstAppearanceYear.status === "higher" ? "↑" : "↓";
      return `${saga}${affiliation}${year}`;
    })
    .join(" ");

  return [`DBDle Classique ${dateKey}`, outcome, clueRow].filter(Boolean).join("\n");
}

function updateStatsOnFinish(currentStats, status) {
  const next = {
    played: currentStats.played + 1,
    wins: status === "won" ? currentStats.wins + 1 : currentStats.wins,
    streak: status === "won" ? currentStats.streak + 1 : 0,
    bestStreak: currentStats.bestStreak,
  };

  if (status === "won") {
    next.bestStreak = Math.max(next.bestStreak, next.streak);
  }

  return next;
}

async function start() {
  const characters = await loadCharacters();

  if (page !== "classic") {
    const labels = {
      quote: "Le mode citation est prévu pour une future mise à jour.",
      silhouette: "Le mode silhouette est prévu pour une future mise à jour.",
    };

    renderPlaceholder(app, labels[page] || "Mode prêt");
    return;
  }

  const answer = getDailyAnswer(dateKey, characters);
  const savedState = loadClassicState(dateKey);
  const stats = loadStats();

  const state = {
    guessText: "",
    rows: [],
    status: "playing",
    shareText: "",
    stats,
    answer,
    guessesRemaining: MAX_GUESSES,
    suggestions: [],
    canGuess: true,
    copyShare: copyText,
  };

  function syncStats() {
    state.guessesRemaining = Math.max(MAX_GUESSES - state.rows.length, 0);
    state.canGuess = state.status === "playing" && state.guessesRemaining > 0;
    state.suggestions = searchCharacters(state.guessText, characters);
  }

  function persist() {
    saveClassicState(dateKey, {
      dateKey,
      guessIds: state.rows.map((row) => row.character.id),
      status: state.status,
    });
  }

  function persistStatsIfNeeded(previousStatus, nextStatus) {
    if (previousStatus === "playing" && nextStatus !== "playing") {
      const nextStats = updateStatsOnFinish(loadStats(), nextStatus);
      state.stats = nextStats;
      saveStats(nextStats);
    }
  }

  function setGuessText(value) {
    state.guessText = value;
    syncStats();
    render();
  }

  function submitGuess(character = null) {
    if (!state.canGuess) {
      return;
    }

    const guess = character || findCharacterByQuery(state.guessText, characters) || state.suggestions[0]?.character || null;
    if (!guess) {
      return;
    }

    if (state.rows.some((row) => row.character.id === guess.id)) {
      state.guessText = "";
      syncStats();
      render();
      return;
    }

    const comparison = compareGuess(guess, answer);
    const nextRows = [...state.rows, { character: guess, comparison }];
    const won = guess.id === answer.id;
    const lost = !won && nextRows.length >= MAX_GUESSES;
    const nextStatus = won ? "won" : lost ? "lost" : "playing";

    const previousStatus = state.status;
    state.rows = nextRows;
    state.status = nextStatus;
    state.guessText = "";
    state.shareText = nextStatus === "playing" ? "" : buildShareText({ status: nextStatus, rows: nextRows });

    persistStatsIfNeeded(previousStatus, nextStatus);
    syncStats();
    persist();
    render();
  }

  function pickSuggestion(character) {
    state.guessText = character.name;
    syncStats();
    submitGuess(character);
  }

  function render() {
    syncStats();

    if (savedState && state.rows.length === 0 && savedState.guessIds?.length) {
      state.rows = savedState.guessIds
        .map((guessId) => characters.find((character) => character.id === guessId))
        .filter(Boolean)
        .map((character) => ({ character, comparison: compareGuess(character, answer) }));
      state.status = savedState.status || "playing";
      state.shareText = state.status === "playing" ? "" : buildShareText({ status: state.status, rows: state.rows });
      syncStats();
    }

    renderClassic(app, {
      ...state,
      setGuessText,
      submitGuess,
      pickSuggestion,
      copyShare: copyText,
    });
  }

  syncStats();
  render();

  if (savedState) {
    state.rows = savedState.guessIds
      .map((guessId) => characters.find((character) => character.id === guessId))
      .filter(Boolean)
      .map((character) => ({ character, comparison: compareGuess(character, answer) }));
    state.status = savedState.status || "playing";
    state.shareText = state.status === "playing" ? "" : buildShareText({ status: state.status, rows: state.rows });
    syncStats();
    render();
  }

  persist();

  window.__dbdleState = state;
  window.__dbdleState.characters = characters;
  window.__dbdleState.submitGuess = submitGuess;
  window.__dbdleState.setGuessText = setGuessText;
  window.__dbdleState.pickSuggestion = pickSuggestion;
}

start().catch((error) => {
  app.innerHTML = `<section class="panel"><strong>Impossible de démarrer le jeu.</strong><p>${error.message}</p></section>`;
  console.error(error);
});