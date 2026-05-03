import { MAX_GUESSES } from "./config.js";
import { toUtcDateKey } from "./core/date.js";
import { getDailyAnswer, getRandomAnswer } from "./core/daily-pick.js";
import { compareGuess } from "./core/compare.js";
import { loadGameState, loadStats, saveGameState, saveStats } from "./core/storage.js";
import { loadCharacters } from "./data/load-data.js";
import { fetchDailyWinnerCount, incrementDailyWinnerCount, isDailyWinnersConfigured } from "./data/daily-winners.js";
import { findCharacterByQuery, searchCharacters } from "./data/search.js";
import { qs } from "./ui/dom.js";
import { renderClassic, renderPlaceholder } from "./ui/render.js";

const app = qs("#app");
const page = document.body.dataset.page || "classic";
let dateKey = toUtcDateKey(new Date());

function getNextUtcMidnight(date = new Date()) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
const modeConfig = {
  classic: {
    modeLabel: "Devine le Guerrier du jour",
    heroCopy:
      "Devinez le personnage Dragon Ball du jour. Le même personnage est partagé pour tout le monde et change à 00:00 UTC.",
    stateKey: dateKey,
    getAnswer: (characters) => getDailyAnswer(dateKey, characters),
    restartLabel: null,
  },
  infinity: {
    modeLabel: "Devine le Guerrier",
    heroCopy:
      "Même principe que le mode classique, mais chaque victoire vous propose un nouveau personnage aléatoire sans attendre le lendemain.",
    stateKey: "current",
    getAnswer: getRandomAnswer,
    restartLabel: "Nouveau personnage",
  },
};

const currentMode = modeConfig[page] || modeConfig.classic;
const isInfinityMode = page === "infinity";

function isValidDailyCount(value) {
  return Number.isInteger(value) && value >= 0;
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
  let countdownTimer = null;
  let nextResetAt = getNextUtcMidnight();

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
    stats,
    answer,
    answerId: answer.id,
    guessesRemaining: isInfinityMode ? null : MAX_GUESSES,
    guessCount: 0,
    suggestions: [],
    canGuess: true,
    modeLabel: currentMode.modeLabel,
    heroCopy: currentMode.heroCopy,
    restartLabel: currentMode.restartLabel,
    onRestart: page === "infinity" ? restartGame : null,
    isInfinity: isInfinityMode,
    countdownLabel: isInfinityMode ? null : formatDuration(nextResetAt - Date.now()),
    dailyWinnersCount: null,
    dailyWinnersLoading: false,
    dailyWinnersError: false,
  };

  async function refreshDailyWinnersCount() {
    if (page !== "classic") {
      return;
    }

    if (!isDailyWinnersConfigured()) {
      state.dailyWinnersLoading = false;
      state.dailyWinnersError = true;
      render();
      return;
    }

    state.dailyWinnersLoading = true;
    state.dailyWinnersError = false;
    render();

    try {
      const nextCount = await fetchDailyWinnerCount(dateKey);
      state.dailyWinnersCount = isValidDailyCount(nextCount) ? nextCount : null;
      state.dailyWinnersLoading = false;
      state.dailyWinnersError = false;
      render();
    } catch (error) {
      state.dailyWinnersLoading = false;
      state.dailyWinnersError = true;
      render();
      console.error("Impossible de charger le compteur quotidien:", error);
    }
  }

  function updateCountdownLabel() {
    if (isInfinityMode) {
      return;
    }

    state.countdownLabel = formatDuration(nextResetAt - Date.now());
    document.querySelectorAll("[data-countdown-slot]").forEach((node) => {
      node.textContent = state.countdownLabel;
    });
  }

  function resetClassicGameForNewDay() {
    if (page !== "classic") {
      return;
    }

    dateKey = toUtcDateKey(new Date());
    currentMode.stateKey = dateKey;
    nextResetAt = getNextUtcMidnight();

    const nextAnswer = currentMode.getAnswer(characters);
    state.answer = nextAnswer;
    state.answerId = nextAnswer.id;
    state.guessText = "";
    state.rows = [];
    state.status = "playing";
    state.guessesRemaining = MAX_GUESSES;
    state.guessCount = 0;
    state.suggestions = [];
    state.canGuess = true;
    state.dailyWinnersCount = null;
    state.dailyWinnersLoading = false;
    state.dailyWinnersError = false;
    updateCountdownLabel();
    persist();
    render();
  }

  function tickCountdown() {
    if (isInfinityMode) {
      return;
    }

    if (Date.now() >= nextResetAt) {
      resetClassicGameForNewDay();
      return;
    }

    updateCountdownLabel();
  }

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

    persistStatsIfNeeded(previousStatus, nextStatus);
    syncStats();
    persist();
    render();

    if (page === "classic" && previousStatus === "playing" && nextStatus === "won") {
      state.dailyWinnersLoading = true;
      state.dailyWinnersError = false;
      render();

      incrementDailyWinnerCount(dateKey)
        .then((nextCount) => {
          if (isValidDailyCount(nextCount)) {
            state.dailyWinnersCount = nextCount;
            state.dailyWinnersLoading = false;
            state.dailyWinnersError = false;
            render();
            return;
          }

          return refreshDailyWinnersCount();
        })
        .catch((error) => {
          state.dailyWinnersLoading = false;
          state.dailyWinnersError = true;
          render();
          console.error("Impossible de mettre a jour le compteur quotidien:", error);
        });
    }
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
    syncStats();
  }

  if (page === "classic" && state.status === "won") {
    await refreshDailyWinnersCount();
  }

  syncStats();
  updateCountdownLabel();
  render();

  if (!isInfinityMode) {
    tickCountdown();
    countdownTimer = window.setInterval(tickCountdown, 1000);
  }

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