import { createEl } from "../dom.js";

export function renderResultBanner({
  status,
  answerName,
  maxGuesses,
  modeLabel = "Mode classique",
  onRestart,
  restartLabel = "Rejouer",
}) {
  const banner = createEl("section", { className: "panel result-banner" });
  const restartButton = onRestart
    ? createEl("button", { className: "guess-button restart-button", text: restartLabel, attrs: { type: "button" } })
    : null;

  if (restartButton) {
    restartButton.addEventListener("click", onRestart);
  }

  if (status === "playing") {
    banner.classList.add("banner-muted");
    banner.append(
      createEl("strong", { text: modeLabel }),
      createEl("p", { text: "Devinez le personnage Dragon Ball du jour." }),
    );
    return banner;
  }

  if (status === "lost") {
    banner.classList.add("banner-lose");
    banner.append(createEl("strong", { text: "Plus d'essais" }), createEl("p", { text: `La réponse était ${answerName}.` }));
    if (restartButton) {
      banner.append(restartButton);
    }
    return banner;
  }

  banner.classList.add("banner-win");
  const victoryCopy = createEl("div", { className: "victory-copy" });
  const victoryArt = createEl("div", {
    className: "victory-art",
    attrs: { "aria-hidden": "true" },
    text: "Photo à venir",
  });

  victoryCopy.append(
    createEl("strong", { text: "Victoire" }),
    createEl("p", { text: answerName ? `Vous avez trouvé ${answerName}.` : "Vous avez trouvé le personnage." }),
  );

  banner.append(victoryCopy, victoryArt);

  if (restartButton) {
    banner.append(restartButton);
  }

  return banner;
}