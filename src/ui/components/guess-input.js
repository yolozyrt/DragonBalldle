import { createEl } from "../dom.js";

export function renderGuessInput({ value, suggestions, disabled, onInput, onSubmit, onPick }) {
  const wrapper = createEl("section", { className: "panel guess-panel" });

  const row = createEl("div", { className: "guess-row" });
  const input = createEl("input", {
    className: "guess-input",
    attrs: {
      type: "text",
      placeholder: "Type a character name or alias",
      value,
      autocomplete: "off",
      disabled: disabled ? "disabled" : null,
    },
  });

  input.value = value;
  input.addEventListener("input", () => onInput(input.value));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  });

  const button = createEl("button", {
    className: "guess-button",
    text: "Guess",
    attrs: { type: "button", disabled: disabled ? "disabled" : null },
  });
  button.addEventListener("click", () => onSubmit());

  row.append(input, button);
  wrapper.append(row);

  if (suggestions.length > 0) {
    const list = createEl("div", { className: "suggestions suggestion-list" });

    suggestions.forEach(({ character, label }) => {
      const suggestion = createEl("button", {
        className: "suggestion-item",
        attrs: { type: "button", disabled: disabled ? "disabled" : null },
      });

      suggestion.append(
        createEl("span", { text: character.name }),
        createEl("span", { className: "suggestion-meta", text: label !== character.name ? label : character.race }),
      );

      suggestion.addEventListener("click", () => onPick(character));
      list.append(suggestion);
    });

    wrapper.append(list);
  }

  return wrapper;
}