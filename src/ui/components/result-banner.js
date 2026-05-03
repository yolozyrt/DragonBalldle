import { createEl } from "../dom.js";

export function renderResultBanner({
  status,
  answerName,
  answerImage,
  maxGuesses,
  modeLabel = "Mode classique",
  onRestart,
  restartLabel = "Rejouer",
}) {
  if (status === "playing") {
    return null;
  }

  const banner = createEl("section", { className: "panel result-banner" });
  const restartButton = onRestart
    ? createEl("button", { className: "guess-button restart-button", text: restartLabel, attrs: { type: "button" } })
    : null;

  if (restartButton) {
    restartButton.addEventListener("click", onRestart);
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
  const victoryHeader = createEl("div", { className: "victory-header" });
  const victoryBody = createEl("div", { className: "victory-body" });
  const victoryCopy = createEl("div", { className: "victory-copy" });
  const victoryArt = createEl("div", { className: "victory-art" });

  if (answerImage) {
    victoryArt.append(
      createEl("img", {
        className: "victory-image",
        attrs: { src: answerImage, alt: answerName || "Personnage trouvé", loading: "eager" },
      }),
    );
  } else {
    victoryArt.append(createEl("span", { text: "Photo indisponible" }));
  }

  victoryHeader.append(createEl("strong", { text: "Victoire" }));
  victoryCopy.append(
    createEl("p", { text: "Tu as trouvé" }),
    createEl("strong", { text: answerName || "le personnage" }),
  );

  victoryBody.append(victoryArt, victoryCopy);
  banner.append(victoryHeader, victoryBody);

  if (restartButton) {
    banner.append(restartButton);
  }

  return banner;
}