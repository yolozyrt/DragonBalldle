import { createEl } from "../dom.js";

function fieldClass(status) {
  if (status === "exact") {
    return "feedback-cell feedback-exact";
  }

  if (status === "partial" || status === "higher" || status === "lower") {
    return "feedback-cell feedback-partial";
  }

  return "feedback-cell feedback-none";
}

function renderYear(status, value) {
  if (status === "exact") {
    return String(value);
  }

  if (status === "higher") {
    return `${value} ↑`;
  }

  if (status === "lower") {
    return `${value} ↓`;
  }

  return String(value);
}

export function renderGuessTable(rows) {
  const wrapper = createEl("section", { className: "panel table-card" });
  const scroll = createEl("div", { className: "table-scroll" });
  const table = createEl("table", { className: "guess-table" });

  table.innerHTML = `
    <thead>
      <tr>
        <th>Nom</th>
        <th>Race</th>
        <th>Saga</th>
        <th>Affiliation</th>
        <th>Alignement</th>
        <th>Année de première apparition</th>
      </tr>
    </thead>
  `;

  const tbody = createEl("tbody");

  if (rows.length === 0) {
    const emptyRow = createEl("tr");
    emptyRow.append(
      createEl("td", {
        className: "empty-state",
        text: "Aucune proposition pour l'instant. Commencez par un personnage pour comparer les indices.",
        attrs: { colSpan: "6" },
      }),
    );
    tbody.append(emptyRow);
  } else {
    rows.forEach(({ character, comparison }) => {
      const row = createEl("tr");
      row.append(
        createEl("td", { className: fieldClass(comparison.name.status), text: character.name }),
        createEl("td", { className: fieldClass(comparison.race.status), text: character.race }),
        createEl("td", { className: fieldClass(comparison.sagas.status), text: character.sagas.join(", ") }),
        createEl("td", { className: fieldClass(comparison.affiliations.status), text: character.affiliations.join(", ") }),
        createEl("td", { className: fieldClass(comparison.alignment.status), text: character.alignment }),
        createEl("td", {
          className: fieldClass(comparison.firstAppearanceYear.status),
          text: renderYear(comparison.firstAppearanceYear.status, comparison.firstAppearanceYear.value),
        }),
      );
      tbody.append(row);
    });
  }

  table.append(tbody);
  scroll.append(table);
  wrapper.append(scroll);
  return wrapper;
}