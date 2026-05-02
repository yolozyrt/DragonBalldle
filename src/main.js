import { MAX_GUESSES } from "./config.js";
import { toUtcDateKey } from "./core/date.js";
import { getDailyAnswer, getRandomAnswer } from "./core/daily-pick.js";
import { compareGuess } from "./core/compare.js";
import { loadGameState, loadStats, saveGameState, saveStats } from "./core/storage.js";
import { loadCharacters } from "./data/load-data.js";
import { findCharacterByQuery, searchCharacters } from "./data/search.js";
import { copyText, qs } from "./ui/dom.js";
import { renderClassic, renderPlaceholder } from "./ui/render.js";

const app = qs("#app");
const page = document.body.dataset.page || "classic";
const dateKey = toUtcDateKey(new Date());
const modeConfig = {
  classic: {
    modeLabel: "Mode classique",
    heroCopy:
      "Devinez le personnage Dragon Ball du jour. L'autocomplétion fonctionne avec les noms et alias, et chaque indice indique votre proximité.",
    stateKey: dateKey,
    getAnswer: (characters) => getDailyAnswer(dateKey, characters),
    restartLabel: null,
  },
  infinity: {
    modeLabel: "Mode Infinity",
    heroCopy:
      "Même principe que le mode classique, mais chaque victoire vous propose un nouveau personnage aléatoire sans attendre le lendemain.",
    stateKey: "current",
    getAnswer: getRandomAnswer,
    restartLabel: "Nouveau personnage",
  },
};

const currentMode = modeConfig[page] || modeConfig.classic;
const isInfinityMode = page === "infinity";

function buildShareText({ status, rows }) {
  const outcome = isInfinityMode ? `${rows.length} essai${rows.length > 1 ? "s" : ""}` : status === "won" ? `${rows.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const clueRow = rows
    .map(({ comparison }) => {
      const saga = comparison.sagas.status === "exact" ? "S" : comparison.sagas.status === "partial" ? "s" : ".";
      const affiliation =
        comparison.affiliations.status === "exact" ? "A" : comparison.affiliations.status === "partial" ? "a" : ".";
      const year = comparison.firstAppearanceYear.status === "exact" ? "Y" : comparison.firstAppearanceYear.status === "higher" ? "↑" : "↓";
      return `${saga}${affiliation}${year}`;
    })
    .join(" ");

  return [`DBDle ${isInfinityMode ? "Infinity" : "Classique"} ${dateKey}`, outcome, clueRow].filter(Boolean).join("\n");
}

function updateStatsOnFinish(currentStats, status, guessCount) {
  const errors = guessCount - 1;
  const next = {
    played: currentStats.played + 1,
    wins: status === "won" ? currentStats.wins + 1 : currentStats.wins,
    streak: status === "won" ? currentStats.streak + 1 : 0,
    bestStreak: currentStats.bestStreak,
    totalErrors: (currentStats.totalErrors || 0) + errors,
  };

  if (status === "won") {
    next.bestStreak = Math.max(next.bestStreak, next.streak);
  }

  return next;
}

async function start() {
  const characters = await loadCharacters();
  let restartTimer = null;

  if (!modeConfig[page]) {
    const labels = {
      quote: "Le mode citation est prévu pour une future mise à jour.",
      silhouette: "Le mode silhouette est prévu pour une future mise à jour.",
    };

    renderPlaceholder(app, labels[page] || "Mode prêt");
    return;
  }

  const savedState = loadGameState(page, currentMode.stateKey);
  const answer = savedState?.answerId
    ? characters.find((character) => character.id === savedState.answerId) || currentMode.getAnswer(characters)
    : currentMode.getAnswer(characters);
  const stats = loadStats(page);

  const state = {
    guessText: "",
    rows: [],
    status: "playing",
    shareText: "",
    stats,
    answer,
    answerId: answer.id,
    guessesRemaining: isInfinityMode ? null : MAX_GUESSES,
    guessCount: 0,
    suggestions: [],
    canGuess: true,
    copyShare: copyText,
    modeLabel: currentMode.modeLabel,
    heroCopy: currentMode.heroCopy,
    restartLabel: currentMode.restartLabel,
    onRestart: page === "infinity" ? restartGame : null,
    isInfinity: isInfinityMode,
  };

  function syncStats() {
    state.guessCount = state.rows.length;
    state.guessesRemaining = isInfinityMode ? null : Math.max(MAX_GUESSES - state.rows.length, 0);
    state.canGuess = state.status === "playing" && (isInfinityMode || state.guessesRemaining > 0);
    const guessedIds = new Set(state.rows.map((row) => row.character.id));
    state.suggestions = searchCharacters(state.guessText, characters).filter(({ character }) => !guessedIds.has(character.id));
  }

  function persist() {
    saveGameState(page, currentMode.stateKey, {
      stateKey: currentMode.stateKey,
      answerId: state.answer.id,
      guessIds: state.rows.map((row) => row.character.id),
      status: state.status,
    });
  }

  function persistStatsIfNeeded(previousStatus, nextStatus) {
    if (previousStatus === "playing" && nextStatus !== "playing") {
      const nextStats = updateStatsOnFinish(loadStats(page), nextStatus, state.rows.length);
      state.stats = nextStats;
      saveStats(page, nextStats);
    }
  }

  function restartGame() {
    if (page !== "infinity") {
      return;
    }

    if (restartTimer) {
      clearTimeout(restartTimer);
      restartTimer = null;
    }

    state.answer = getRandomAnswer(characters);
    state.answerId = state.answer.id;
    state.guessText = "";
    state.rows = [];
    state.status = "playing";
    state.shareText = "";
    state.stats = loadStats(page);
    syncStats();
    persist();
    render();
  }

  function getGuessLabel() {
    if (isInfinityMode) {
      return `${state.guessCount} proposition${state.guessCount === 1 ? "" : "s"}`;
    }

    return `${state.guessesRemaining} essais restants`;
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

    const comparison = compareGuess(guess, state.answer);
    const nextRows = [{ character: guess, comparison }, ...state.rows];
    const won = guess.id === state.answer.id;
    const lost = !isInfinityMode && !won && nextRows.length >= MAX_GUESSES;
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

    renderClassic(app, {
      ...state,
      guessLabel: getGuessLabel(),
      setGuessText,
      submitGuess,
      pickSuggestion,
      copyShare: copyText,
    });

    // Re-focus l'input après le rendu pour éviter la perte de focus lors de la saisie
    if (state.canGuess) {
      const guessInput = qs(".guess-input");
      if (guessInput) {
        guessInput.focus();
        // Placer le curseur à la fin du texte
        guessInput.setSelectionRange(state.guessText.length, state.guessText.length);
      }
    }
  }

  if (savedState) {
    state.rows = savedState.guessIds
      .map((guessId) => characters.find((character) => character.id === guessId))
      .filter(Boolean)
      .map((character) => ({ character, comparison: compareGuess(character, state.answer) }));
    state.status = savedState.status || "playing";
    state.shareText = state.status === "playing" ? "" : buildShareText({ status: state.status, rows: state.rows });
    syncStats();
  }

  syncStats();
  render();

  persist();

  window.__dbdleState = state;
  window.__dbdleState.characters = characters;
  window.__dbdleState.submitGuess = submitGuess;
  window.__dbdleState.setGuessText = setGuessText;
  window.__dbdleState.pickSuggestion = pickSuggestion;
  window.__dbdleState.restartGame = restartGame;
}

start().catch((error) => {
  app.innerHTML = `<section class="panel"><strong>Impossible de démarrer le jeu.</strong><p>${error.message}</p></section>`;
  console.error(error);
});