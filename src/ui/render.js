import { APP_NAME, MAX_GUESSES } from "../config.js";
import { createEl, clearEl } from "./dom.js";
import { renderGuessInput } from "./components/guess-input.js";
import { renderGuessTable } from "./components/guess-table.js";
import { renderResultBanner } from "./components/result-banner.js";

function buildHeader({
  modeLabel = "Mode classique",
  heroCopy = "Devinez le personnage Dragon Ball du jour. L'autocomplétion fonctionne avec les noms et alias, et chaque indice indique votre proximité.",
  status,
  answerName,
  answerImage,
  onRestart,
  restartLabel = "Rejouer",
} = {}) {
  const stack = createEl("div", { className: "hero-stack" });
  const logo = createEl("img", {
    className: "page-logo",
    attrs: {
      src: "/assets/images/Gemini_Generated_Image_tcxfn2tcxfn2tcxf-removebg-preview.png",
      alt: "DragonBalldle - Le Défi",
      loading: "eager",
      decoding: "async",
    },
  });
  const header = createEl("header", { className: "hero-card" });
  const modeButtons = [
    {
      href: "/index.html",
      image: "/assets/images/Gemini_Generated_Image_4inpk34inpk34inp-removebg-preview.png",
      label: "Mode classique",
    },
    {
      href: "/modes/infinity.html",
      image: "/assets/images/Gemini_Generated_Image_193lql193lql193l-removebg-preview.png",
      label: "Mode Infinity",
    },
    {
      href: "/modes/quote.html",
      image: "/assets/images/Gemini_Generated_Image_j1946lj1946lj194-removebg-preview.png",
      label: "Mode citation",
    },
    {
      href: "/modes/silhouette.html",
      image: "/assets/images/Gemini_Generated_Image_ff3nykff3nykff3n-removebg-preview.png",
      label: "Mode silhouette",
    },
  ];

  const modeLinks = createEl("nav", { className: "mode-shortcuts", attrs: { "aria-label": "Changer de mode" } });

  modeButtons.forEach(({ href, image, label }) => {
    const link = createEl("a", {
      className: "mode-shortcut",
      attrs: { href, "aria-label": label, title: label },
    });
    link.append(
      createEl("img", {
        className: "mode-shortcut-image",
        attrs: { src: image, alt: label, loading: "eager", decoding: "async" },
      }),
    );
    modeLinks.append(link);
  });

  const resultContainer = createEl("div", { className: "hero-result" });

  header.append(
    createEl("p", { className: "eyebrow", text: APP_NAME }),
    createEl("h1", { className: "hero-title", text: modeLabel }),
  );

  // If the player has won, show the found character inside the hero-card.
  if (status === "won" && answerName) {
    const art = createEl("div", { className: "hero-result-art" });
    const message = createEl("p", { className: "hero-result-message", text: "Bravo ! Tu as trouve le personnage." });
    if (answerImage) {
      art.append(
        createEl("img", {
          className: "hero-result-image",
          attrs: { src: answerImage, alt: answerName, loading: "eager", decoding: "async" },
        }),
      );
    } else {
      art.append(createEl("span", { className: "hero-result-fallback", text: "Image indisponible" }));
    }
    const caption = createEl("div", { className: "hero-result-caption", text: answerName });
    resultContainer.append(message, art, caption);

    if (onRestart) {
      const restartButton = createEl("button", {
        className: "guess-button restart-button hero-restart",
        text: restartLabel,
        attrs: { type: "button" },
      });
      restartButton.addEventListener("click", onRestart);
      resultContainer.append(restartButton);
    }

    header.append(resultContainer);
  } else {
    header.append(createEl("p", { className: "hero-copy", text: heroCopy }));
  }
  // Place the small mode shortcut buttons outside the hero bubble,
  // between the page logo and the hero card (bubble).
  stack.append(logo, modeLinks, header);
  return stack;
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

  const hero = buildHeader({
    modeLabel: state.modeLabel,
    heroCopy: state.heroCopy,
    status: state.status,
    answerName: state.answer ? state.answer.name : undefined,
    answerImage: state.status === "won" && state.answer ? state.answer.image : undefined,
    onRestart: state.onRestart,
    restartLabel: state.restartLabel,
  });
  const layout = createEl("section", { className: "game-layout" });

  const banner = renderResultBanner({
    status: state.status,
    answerName: state.status === "won" || state.status === "lost" ? state.answer.name : undefined,
    answerImage: state.status === "won" ? state.answer.image : undefined,
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

  const footer = buildFooter({ stats: state.stats, guessLabel: state.guessLabel || `${state.guessesRemaining} essais restants`, isInfinity: state.isInfinity });

  if (banner) {
    layout.append(banner);
  }
  layout.append(guessInput);
  
  // N'afficher la table que s'il y a des guesses
  if (state.rows.length > 0) {
    const table = renderGuessTable(state.rows);
    layout.append(table);
  }
  
  layout.append(footer);
  app.append(hero, layout);
}