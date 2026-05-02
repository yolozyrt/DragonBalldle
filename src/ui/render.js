import { APP_NAME, MAX_GUESSES } from "../config.js";
import { createEl, clearEl } from "./dom.js";
import { renderGuessInput } from "./components/guess-input.js";
import { renderGuessTable } from "./components/guess-table.js";
import { renderResultBanner } from "./components/result-banner.js";

function buildHeader({
  modeLabel = "Mode classique",
  heroCopy = "Devinez le personnage Dragon Ball du jour. L'autocomplétion fonctionne avec les noms et alias, et chaque indice indique votre proximité.",
} = {}) {
  const header = createEl("header", { className: "hero-card" });
  header.append(
    createEl("p", { className: "eyebrow", text: APP_NAME }),
    createEl("h1", { className: "hero-title", text: modeLabel }),
    createEl("p", { className: "hero-copy", text: heroCopy }),
    createEl("nav", {
      className: "mode-links",
      html: `
        <a href="/index.html">Classique</a>
        <a href="/modes/classic.html">Page classique</a>
        <a href="/modes/infinity.html">Infinity</a>
        <a href="/modes/quote.html">Citation</a>
        <a href="/modes/silhouette.html">Silhouette</a>
      `,
    }),
  );
  return header;
}

function buildFooter({ stats, guessLabel, isInfinity }) {
  const footer = createEl("footer", { className: "game-footer" });

  if (isInfinity) {
    footer.append(
      createEl("div", { html: `<strong>${guessLabel}</strong>` }),
    );
    footer.append(
      createEl("div", {
        text: `Parties jouées : ${stats.played}`,
      }),
      createEl("div", {
        text: `Erreurs totales : ${stats.totalErrors || 0}`,
      }),
    );
  } else {
    footer.append(
      createEl("div", {
        text: `Statistiques : ${stats.wins} victoire${stats.wins === 1 ? "" : "s"} / ${stats.played} parties`,
      }),
    );
  }

  return footer;
}

export function renderPlaceholder(app, title, copy = "Ce mode est provisionnel pour permettre l'évolution du projet sans modifier l'architecture.") {
  clearEl(app);

  const hero = buildHeader();
  const panel = createEl("section", { className: "panel placeholder-panel" });
  panel.append(
    createEl("span", { className: "placeholder-badge", text: "Bientôt disponible" }),
    createEl("h2", { className: "hero-title", text: title }),
    createEl("p", { className: "hero-copy", text: copy }),
  );

  app.append(hero, panel);
}

export function renderClassic(app, state) {
  clearEl(app);

  const hero = buildHeader({ modeLabel: state.modeLabel, heroCopy: state.heroCopy });
  const layout = createEl("section", { className: "game-layout" });

  const banner = renderResultBanner({
    status: state.status,
    answerName: state.status === "won" || state.status === "lost" ? state.answer.name : undefined,
    maxGuesses: MAX_GUESSES,
    modeLabel: state.modeLabel,
    onRestart: state.onRestart,
    restartLabel: state.restartLabel,
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
  const footer = buildFooter({ stats: state.stats, guessLabel: state.guessLabel || `${state.guessesRemaining} essais restants`, isInfinity: state.isInfinity });

  layout.append(banner, guessInput, table, footer);
  app.append(hero, layout);
}