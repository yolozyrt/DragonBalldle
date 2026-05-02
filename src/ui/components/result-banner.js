import { createEl } from "../dom.js";

export function renderResultBanner({ status, answerName, guessesUsed, maxGuesses, shareText, onCopyShare }) {
  const banner = createEl("section", { className: "panel result-banner" });

  if (status === "playing") {
    banner.classList.add("banner-muted");
    banner.append(
      createEl("strong", { text: "Mode classique" }),
      createEl("p", { text: `${maxGuesses} essais pour trouver le personnage Dragon Ball du jour.` }),
    );
    return banner;
  }

  if (status === "lost") {
    banner.classList.add("banner-lose");
    banner.append(createEl("strong", { text: "Plus d'essais" }), createEl("p", { text: `La réponse était ${answerName}.` }));
    return banner;
  }

  banner.classList.add("banner-win");
  banner.append(createEl("strong", { text: "Bravo" }), createEl("p", { text: `Trouvé en ${guessesUsed}/${maxGuesses} essais.` }));

  if (shareText) {
    const shareBox = createEl("div", { className: "share-box" });
    const textarea = createEl("textarea", { attrs: { readonly: "readonly", rows: "5" } });
    textarea.value = shareText;
    shareBox.append(textarea);

    if (onCopyShare) {
      const copyButton = createEl("button", { className: "guess-button copy-button", text: "Copier le texte à partager", attrs: { type: "button" } });
      copyButton.addEventListener("click", onCopyShare);
      shareBox.append(copyButton);
    }

    banner.append(shareBox);
  }

  return banner;
}