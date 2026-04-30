import { APP_NAME, MAX_GUESSES } from "../config.js";
import { createEl, clearEl } from "./dom.js";
import { renderGuessInput } from "./components/guess-input.js";
import { renderGuessTable } from "./components/guess-table.js";
import { renderResultBanner } from "./components/result-banner.js";

function buildHeader() {
  const header = createEl("header", { className: "hero-card" });
  header.append(
    createEl("p", { className: "eyebrow", text: APP_NAME }),
    createEl("h1", { className: "hero-title", text: "Classic mode" }),
    createEl("p", {
      className: "hero-copy",
      text: "Guess the daily Dragon Ball character. Autocomplete works with names and aliases, and each clue tells you how close you are.",
    }),
    createEl("nav", {
      className: "mode-links",
      html: `
        <a href="/index.html">Classic</a>
        <a href="/modes/classic.html">Classic page</a>
        <a href="/modes/quote.html">Quote</a>
        <a href="/modes/silhouette.html">Silhouette</a>
      `,
    }),
  );
  return header;
}

function buildFooter({ stats, guessesRemaining }) {
  const footer = createEl("footer", { className: "game-footer" });
  footer.append(
    createEl("div", { html: `<strong>${guessesRemaining}</strong> guesses left` }),
    createEl("div", {
      text: `Stats: ${stats.wins} win${stats.wins === 1 ? "" : "s"} / ${stats.played} played`,
    }),
  );
  return footer;
}

export function renderPlaceholder(app, title) {
  clearEl(app);

  const hero = buildHeader();
  const panel = createEl("section", { className: "panel placeholder-panel" });
  panel.append(
    createEl("span", { className: "placeholder-badge", text: "Coming soon" }),
    createEl("h2", { className: "hero-title", text: title }),
    createEl("p", {
      className: "hero-copy",
      text: "This mode is scaffolded now so the project can grow without changing the architecture.",
    }),
  );

  app.append(hero, panel);
}

export function renderClassic(app, state) {
  clearEl(app);

  const hero = buildHeader();
  const layout = createEl("section", { className: "game-layout" });

  const banner = renderResultBanner({
    status: state.status,
    answerName: state.status === "lost" ? state.answer.name : undefined,
    guessesUsed: state.rows.length,
    maxGuesses: MAX_GUESSES,
    shareText: state.shareText || undefined,
    onCopyShare: state.shareText ? () => state.copyShare(state.shareText) : undefined,
  });

  const guessInput = renderGuessInput({
    value: state.guessText,
    suggestions: state.suggestions,
    disabled: !state.canGuess,
    onInput: state.setGuessText,
    onSubmit: state.submitGuess,
    onPick: state.pickSuggestion,
  });

  const table = renderGuessTable(state.rows);
  const footer = buildFooter({ stats: state.stats, guessesRemaining: state.guessesRemaining });

  layout.append(banner, guessInput, table, footer);
  app.append(hero, layout);
}