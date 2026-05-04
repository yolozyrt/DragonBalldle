import { APP_NAME, MAX_GUESSES } from "../config.js";
import { createEl, clearEl, assetPath } from "./dom.js";
import { submitContactMessage } from "../data/contact.js";
import { renderGuessInput } from "./components/guess-input.js";
import { renderGuessTable } from "./components/guess-table.js";
import { renderResultBanner } from "./components/result-banner.js";

let lastVictoryFxTick = 0;

function playVictoryAnimation(app) {
  const heroCard = app.querySelector(".hero-card");
  const heroStack = app.querySelector(".hero-stack");
  if (!heroCard || !heroStack) {
    return;
  }

  app.classList.remove("app-shell--victory-boost");
  void app.offsetWidth;
  app.classList.add("app-shell--victory-boost");

  heroCard.classList.remove("hero-card--victory-pop");
  void heroCard.offsetWidth;
  heroCard.classList.add("hero-card--victory-pop");

  const flash = createEl("div", {
    className: "victory-energy-flash",
    attrs: { "aria-hidden": "true" },
  });

  const ringLayer = createEl("div", {
    className: "victory-rings",
    attrs: { "aria-hidden": "true" },
  });

  for (let i = 0; i < 3; i += 1) {
    const ring = createEl("span", { className: "victory-ring" });
    ring.style.animationDelay = `${(i * 0.12).toFixed(2)}s`;
    ringLayer.append(ring);
  }

  const burst = createEl("div", {
    className: "victory-burst",
    attrs: { "aria-hidden": "true" },
  });

  const rain = createEl("div", {
    className: "victory-rain",
    attrs: { "aria-hidden": "true" },
  });

  const heroRect = heroCard.getBoundingClientRect();
  const stackRect = heroStack.getBoundingClientRect();
  const burstPadding = 28;
  const burstWidth = heroRect.width + burstPadding * 2;
  const burstHeight = heroRect.height + burstPadding * 2;
  const centerX = burstWidth / 2;
  const centerY = burstHeight / 2;

  burst.classList.add("victory-burst--around");
  burst.style.left = `${heroRect.left - stackRect.left - burstPadding}px`;
  burst.style.top = `${heroRect.top - stackRect.top - burstPadding}px`;
  burst.style.width = `${burstWidth}px`;
  burst.style.height = `${burstHeight}px`;

  rain.style.left = "0";
  rain.style.top = "0";
  rain.style.width = "100vw";
  rain.style.height = "100vh";

  const colors = ["#ffe66d", "#ff9f1c", "#35e06c", "#6bc5ff", "#ff6f91"];
  for (let i = 0; i < 60; i += 1) {
    const piece = createEl("span", {
      className: "victory-burst-piece",
    });

    const edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (edge === 0) {
      x = Math.random() * burstWidth;
      y = Math.random() * 12;
    } else if (edge === 1) {
      x = burstWidth - Math.random() * 12;
      y = Math.random() * burstHeight;
    } else if (edge === 2) {
      x = Math.random() * burstWidth;
      y = burstHeight - Math.random() * 12;
    } else {
      x = Math.random() * 12;
      y = Math.random() * burstHeight;
    }

    const dx = x - centerX;
    const dy = y - centerY;
    const length = Math.hypot(dx, dy) || 1;
    const speed = 40 + Math.random() * 120;
    const driftX = (dx / length) * speed + (Math.random() - 0.5) * 50;
    const driftY = (dy / length) * speed + (Math.random() - 0.5) * 50;

    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${(Math.random() * 0.18).toFixed(2)}s`;
    piece.style.setProperty("--x-drift", `${Math.round(driftX)}px`);
    piece.style.setProperty("--y-drift", `${Math.round(driftY)}px`);
    piece.style.transform = `rotate(${Math.round(Math.random() * 220)}deg)`;
    burst.append(piece);
  }

  for (let i = 0; i < 46; i += 1) {
    const piece = createEl("span", {
      className: "victory-rain-piece",
    });
    const left = Math.random() * 100;
    const drift = Math.round((Math.random() - 0.5) * 160);
    const size = 5 + Math.random() * 6;
    const duration = 7 + Math.random() * 4.5;

    piece.style.left = `${left}vw`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 1.8}px`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--rain-drift", `${drift}px`);
    piece.style.setProperty("--rain-duration", `${duration.toFixed(2)}s`);
    piece.style.animationDelay = `${(Math.random() * 2.2).toFixed(2)}s`;
    rain.append(piece);
  }

  heroCard.append(flash, ringLayer);
  heroStack.append(burst);
  document.body.append(rain);
  window.setTimeout(() => flash.remove(), 520);
  window.setTimeout(() => ringLayer.remove(), 1200);
  window.setTimeout(() => burst.remove(), 3200);
  window.setTimeout(() => rain.remove(), 10500);
  window.setTimeout(() => heroCard.classList.remove("hero-card--victory-pop"), 900);
  window.setTimeout(() => app.classList.remove("app-shell--victory-boost"), 680);
}

function openContactModal() {
  const overlay = createEl("div", {
    className: "contact-modal-backdrop",
    attrs: { role: "presentation" },
  });
  const dialog = createEl("section", {
    className: "contact-modal",
    attrs: {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "contact-modal-title",
    },
  });
  const title = createEl("h3", {
    className: "contact-modal-title",
    text: "Nous contacter",
    attrs: { id: "contact-modal-title" },
  });
  const hint = createEl("p", {
    className: "contact-modal-copy",
    text: "Partagez votre message, suggestion ou bug. Nous le recevrons directement dans la base de donnees.",
  });
  const textarea = createEl("textarea", {
    className: "contact-modal-textarea",
    attrs: {
      name: "message",
      rows: "8",
      maxlength: "2000",
      required: "true",
      placeholder: "Votre message...",
    },
  });
  const status = createEl("p", {
    className: "contact-modal-status",
    attrs: { "aria-live": "polite" },
  });
  const sendButton = createEl("button", {
    className: "contact-modal-send",
    text: "Envoyer",
    attrs: { type: "submit" },
  });
  const closeButton = createEl("button", {
    className: "contact-modal-close",
    text: "Fermer",
    attrs: { type: "button", "aria-label": "Fermer la popup" },
  });

  const actions = createEl("div", { className: "contact-modal-actions" });
  actions.append(sendButton, closeButton);

  const form = createEl("form", { className: "contact-modal-form" });
  form.append(title, hint, textarea, status, actions);
  dialog.append(form);
  overlay.append(dialog);
  document.body.append(overlay);
  textarea.focus();

  let isSending = false;

  const closeModal = () => {
    if (isSending) {
      return;
    }

    document.removeEventListener("keydown", onEsc);
    overlay.remove();
  };

  const setStatus = (message, variant = "info") => {
    status.textContent = message;
    status.dataset.variant = variant;
  };

  const onEsc = (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  closeButton.addEventListener("click", closeModal);
  document.addEventListener("keydown", onEsc);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = textarea.value.trim();
    if (message.length < 5) {
      setStatus("Le message doit contenir au moins 5 caracteres.", "error");
      return;
    }

    isSending = true;
    sendButton.disabled = true;
    closeButton.disabled = true;
    textarea.disabled = true;
    setStatus("Envoi en cours...", "info");

    try {
      await submitContactMessage({
        message,
        pagePath: window.location.pathname,
        mode: document.body.dataset.page || "classic",
        userAgent: navigator.userAgent,
      });

      textarea.value = "";
      setStatus("Message envoye. Merci pour votre retour !", "success");
    } catch (error) {
      const safeMessage = error instanceof Error ? error.message : "Erreur inconnue lors de l'envoi.";
      setStatus(safeMessage, "error");
    } finally {
      isSending = false;
      sendButton.disabled = false;
      closeButton.disabled = false;
      textarea.disabled = false;
      textarea.focus();
    }
  });
}

function buildHeader({
  eyebrow = APP_NAME,
  modeLabel = "Devine le Guerrier du jour",
  heroCopy = "Devinez le personnage Dragon Ball du jour. L'autocomplétion fonctionne avec les noms et alias, et chaque indice indique votre proximité.",
  countdownLabel,
  showDailyWinners = false,
  dailyWinnersCount,
  dailyWinnersLoading,
  dailyWinnersError,
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
      src: assetPath("assets/images/Gemini_Generated_Image_tcxfn2tcxfn2tcxf-removebg-preview.png"),
      alt: "DragonBalldle - Le Défi",
      loading: "eager",
      decoding: "async",
    },
  });
  const header = createEl("header", { className: "hero-card" });
  const modeButtons = [
    {
      href: assetPath("index.html"),
      image: assetPath("assets/images/Gemini_Generated_Image_4inpk34inpk34inp-removebg-preview.png"),
      label: "Mode classique",
    },
    {
      href: assetPath("modes/infinity.html"),
      image: assetPath("assets/images/Gemini_Generated_Image_193lql193lql193l-removebg-preview.png"),
      label: "Devine le Guerrier",
    },
    {
      href: assetPath("modes/quote.html"),
      image: assetPath("assets/images/Gemini_Generated_Image_j1946lj1946lj194-removebg-preview.png"),
      label: "Mode citation",
    },
    {
      href: assetPath("modes/silhouette.html"),
      image: assetPath("assets/images/Gemini_Generated_Image_ff3nykff3nykff3n-removebg-preview.png"),
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
    createEl("p", { className: "eyebrow", text: eyebrow }),
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

    if (showDailyWinners) {
      let winnersText = "Chargement du compteur...";
      if (Number.isInteger(dailyWinnersCount) && dailyWinnersCount >= 0) {
        winnersText =
          dailyWinnersCount === 1
            ? `<strong>${dailyWinnersCount}</strong> joueur a trouve le personnage aujourd'hui`
            : `<strong>${dailyWinnersCount}</strong> joueurs ont trouve le personnage aujourd'hui`;
      } else if (dailyWinnersError && !dailyWinnersLoading) {
        winnersText = "Compteur indisponible pour le moment.";
      }

      resultContainer.append(
        createEl("p", {
          className: "daily-winners-note",
          html: `<span class="daily-winners-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M12 2a4 4 0 0 1 4 4v1h2a2 2 0 0 1 2 2v1.7a5.5 5.5 0 0 1-4.2 5.3 3.5 3.5 0 0 1-3.3 2.2h-1a3.5 3.5 0 0 1-3.3-2.2A5.5 5.5 0 0 1 4 10.7V9a2 2 0 0 1 2-2h2V6a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v1h4V6a2 2 0 0 0-2-2zm-6 5v1.7a3.5 3.5 0 0 0 2.3 3.3c-.2-.5-.3-1-.3-1.5V9H6zm10 0v3.5c0 .5-.1 1-.3 1.5a3.5 3.5 0 0 0 2.3-3.3V9h-2zm-5.5 7.2h3a1.5 1.5 0 0 1-1.5 1.5 1.5 1.5 0 0 1-1.5-1.5z"/></svg></span><span>${winnersText}</span>`,
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
    attrs: { type: "button", title: "Nous contacter" },
  });
  contactButton.addEventListener("click", (event) => {
    event.preventDefault();
    openContactModal();
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
    eyebrow: state.isInfinity ? "Mode infini" : "Mode classique",
    modeLabel: state.modeLabel,
    heroCopy: state.heroCopy,
    countdownLabel: state.countdownLabel,
    showDailyWinners: !state.isInfinity,
    dailyWinnersCount: state.dailyWinnersCount,
    dailyWinnersLoading: state.dailyWinnersLoading,
    dailyWinnersError: state.dailyWinnersError,
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

  if (state.status === "won" && state.victoryFxTick && state.victoryFxTick !== lastVictoryFxTick) {
    lastVictoryFxTick = state.victoryFxTick;
    playVictoryAnimation(app);
  }
}