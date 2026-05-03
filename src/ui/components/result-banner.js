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

  // The win state is rendered directly inside the hero bubble.
  return null;
}