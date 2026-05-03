import { APP_NAME, MAX_GUESSES } from "../config.js";
import { createEl, clearEl } from "./dom.js";
import { renderGuessInput } from "./components/guess-input.js";
import { renderGuessTable } from "./components/guess-table.js";
import { renderResultBanner } from "./components/result-banner.js";

function buildHeader({
  modeLabel = "Devine le Guerrier du jour",
  heroCopy = "Devinez le personnage Dragon Ball du jour. L'autocomplétion fonctionne avec les noms et alias, et chaque indice indique votre proximité.",
  countdownLabel,
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
      label: "Devine le Guerrier",
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

    if (countdownLabel) {
      resultContainer.append(
        createEl("p", {
          className: "daily-reset-note daily-reset-note--victory",
          html: `Nouveau personnage dans <strong class="daily-reset-countdown" data-countdown-slot="hero">${countdownLabel}</strong>`,
        }),
      );
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

function buildFooter({ stats, guessLabel, isInfinity, countdownLabel }) {
  const footer = createEl("footer", { className: "game-footer" });
  const icon = (path) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;

  const metrics = isInfinity
    ? [
        {
          icon: icon("M7 4h10v3h3v4c0 2.8-1.8 5.1-4.5 5.8A4.5 4.5 0 0 1 11 19h2v2H7v-2h2a4.5 4.5 0 0 1-4.5-4.2C1.8 16.1 0 13.8 0 11V7h3V4h4zm1 3H5v2c0 1.7 1.1 3.1 2.7 3.6l.3.1V7zm10 0h-3v5.7l.3-.1c1.6-.5 2.7-1.9 2.7-3.6V7z"),
          label: "Propositions",
          value: guessLabel,
        },
        {
          icon: icon("M3 5h18v13H7l-4 4V5zm4 4h10v2H7V9zm0 4h7v2H7v-2z"),
          label: "Parties jouées",
          value: String(stats.played),
        },
        {
          icon: icon("M11 2l2.8 5.7L20 9l-4.5 4.4 1.1 6.2L11 17.9 5.4 19.6l1.1-6.2L2 9l6.2-1.3L11 2z"),
          label: "Erreurs totales",
          value: String(stats.totalErrors || 0),
        },
      ]
    : [
        {
          icon: icon("M12 2 4 6v6c0 5 3.4 9.7 8 10 4.6-.3 8-5 8-10V6l-8-4zm-1 13-3.5-3.5 1.4-1.4L11 12.2l4.1-4.1 1.4 1.4L11 15z"),
          label: "Victoires",
          value: `${stats.wins}`,
        },
        {
          icon: icon("M5 3h14v4H5V3zm0 6h14v12H5V9zm2 2v8h10v-8H7z"),
          label: "Parties jouées",
          value: String(stats.played),
        },
        {
          icon: icon("M12 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6zm0 8.5A2.5 2.5 0 1 1 12 5a2.5 2.5 0 0 1 0 5.5z"),
          label: "Prochain perso",
          value: countdownLabel || "00:00:00",
          countdown: true,
        },
      ];

  const dashboard = createEl("div", { className: "footer-dashboard" });
  const metricsGrid = createEl("div", { className: "footer-metrics" });

  metrics.forEach(({ icon: svg, label, value, countdown = false }) => {
    const card = createEl("div", { className: "footer-metric" });
    const valueClass = countdown ? "footer-metric-value daily-reset-countdown" : "footer-metric-value";
    card.append(
      createEl("span", { className: "footer-metric-icon", html: svg }),
      createEl("span", { className: "footer-metric-label", text: label }),
      createEl("strong", { className: valueClass, text: value, attrs: countdown ? { "data-countdown-slot": "footer" } : {} }),
    );
    metricsGrid.append(card);
  });

  const contactButton = createEl("button", {
    className: "footer-contact-button",
    text: "Nous contacter",
    attrs: { type: "button", title: "Bientôt disponible" },
  });
  contactButton.addEventListener("click", (event) => {
    event.preventDefault();
  });

  dashboard.append(
    createEl("div", {
      className: "footer-title-block",
      html: `<span class="footer-kicker">Tableau de bord</span><strong>${isInfinity ? "Mode infini" : "Mode classique"}</strong>`,
    }),
    metricsGrid,
  );

  const actions = createEl("div", { className: "footer-actions" });
  actions.append(contactButton);

  footer.append(dashboard, actions);

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
    countdownLabel: state.countdownLabel,
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

  const footer = buildFooter({
    stats: state.stats,
    guessLabel: state.guessLabel || `${state.guessesRemaining} essais restants`,
    isInfinity: state.isInfinity,
    countdownLabel: state.countdownLabel,
  });

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