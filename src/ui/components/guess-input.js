import { createEl } from "../dom.js";

export function renderGuessInput({ value, suggestions, disabled, onInput, onSubmit, onPick }) {
  const wrapper = createEl("section", { className: "guess-panel" });

  const row = createEl("div", { className: "guess-row" });
  const input = createEl("input", {
    className: "guess-input",
    attrs: {
      type: "text",
      placeholder: "Tapez le nom ou un alias du personnage",
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
    text: "Chercher",
    attrs: { type: "button", disabled: disabled ? "disabled" : null },
  });
  button.prepend(
    createEl("img", {
      className: "guess-button-icon",
      attrs: {
        src: "/assets/images/Gemini_Generated_Image_tcxfn2tcxfn2tcxf-removebg-preview.png",
        alt: "",
        "aria-hidden": "true",
      },
    }),
  );
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

      const preview = createEl("div", { className: "suggestion-preview" });
      if (character.image) {
        preview.append(
          createEl("img", {
            className: "suggestion-image",
            attrs: {
              src: character.image,
              alt: character.name,
              loading: "lazy",
            },
          }),
        );
      }

      suggestion.append(
        preview,
        createEl("span", { className: "suggestion-content", text: character.name }),
      );

      suggestion.addEventListener("click", () => onPick(character));
      list.append(suggestion);
    });

    wrapper.append(list);
  }

  return wrapper;
}