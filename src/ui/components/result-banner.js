import { createEl } from "../dom.js";

export function renderResultBanner({ status, answerName, guessesUsed, maxGuesses, shareText, onCopyShare }) {
  const banner = createEl("section", { className: "panel result-banner" });

  if (status === "playing") {
    banner.classList.add("banner-muted");
    banner.append(
      createEl("strong", { text: "Classic mode" }),
      createEl("p", { text: `${maxGuesses} tries to find the daily Dragon Ball character.` }),
    );
    return banner;
  }

  if (status === "lost") {
    banner.classList.add("banner-lose");
    banner.append(createEl("strong", { text: "Out of guesses" }), createEl("p", { text: `The answer was ${answerName}.` }));
    return banner;
  }

  banner.classList.add("banner-win");
  banner.append(createEl("strong", { text: "Correct" }), createEl("p", { text: `Solved in ${guessesUsed}/${maxGuesses} guesses.` }));

  if (shareText) {
    const shareBox = createEl("div", { className: "share-box" });
    const textarea = createEl("textarea", { attrs: { readonly: "readonly", rows: "5" } });
    textarea.value = shareText;
    shareBox.append(textarea);

    if (onCopyShare) {
      const copyButton = createEl("button", { className: "guess-button copy-button", text: "Copy share text", attrs: { type: "button" } });
      copyButton.addEventListener("click", onCopyShare);
      shareBox.append(copyButton);
    }

    banner.append(shareBox);
  }

  return banner;
}