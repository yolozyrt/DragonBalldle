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

  // Keep the year value only; visual hint arrow is provided by CSS (.hint-up / .hint-down)
  if (status === "higher") {
    return String(value);
  }

  if (status === "lower") {
    return String(value);
  }

  return String(value);
}

function renderEpisode(status, value) {
  if (status === "exact") {
    return String(value);
  }

  // Visual hint arrows are handled in CSS; keep content minimal for design
  if (status === "higher") {
    return String(value);
  }

  if (status === "lower") {
    return String(value);
  }

  return String(value || "-");
}

export function renderGuessTable(rows) {
  const wrapper = createEl("section", { className: "table-card" });
  const scroll = createEl("div", { className: "table-scroll" });
  const table = createEl("table", { className: "guess-table" });
  table.innerHTML = `
    <thead>
      <tr>
        <th>Personnage</th>
        <th>Nom</th>
        <th>Race</th>
        <th>Saga</th>
        <th>Affiliation</th>
        <th>Alignement</th>
        <th>Année de première apparition</th>
        <th>Série première apparition</th>
        <th>Épisode première apparition</th>
      </tr>
    </thead>
  `;

  // enforce equal responsive column widths so every cell stays inside the container
  const colgroup = createEl("colgroup");
  for (let i = 0; i < 9; i++) {
    colgroup.append(createEl("col", { attrs: { style: "width:11.1111%;" } }));
  }
  table.prepend(colgroup);

  const tbody = createEl("tbody");

  const cellAttrs = (label) => ({ "data-label": label });

  if (rows.length === 0) {
    const emptyRow = createEl("tr");
    emptyRow.append(
      createEl("td", {
        className: "empty-state",
        text: "Aucune proposition pour l'instant. Commencez par un personnage pour comparer les indices.",
        attrs: { colSpan: "9", "data-label": "État" },
      }),
    );
    tbody.append(emptyRow);
  } else {
    rows.forEach(({ character, comparison }) => {
      const row = createEl("tr");
      // image cell should not receive feedback coloring; keep separate class
      const imageCell = createEl("td", { className: "image-cell", attrs: cellAttrs("Personnage") });
      if (character.image) {
        const imageWrap = createEl("div", { className: "table-image-preview" });
        const img = createEl("img", {
          className: "table-image",
          attrs: { src: character.image, alt: character.name, loading: "lazy" },
        });
        imageWrap.append(img);
        imageCell.append(imageWrap);
      }
      const nameTd = createEl("td", { className: fieldClass(comparison.name.status), text: character.name, attrs: cellAttrs("Nom") });
      const raceTd = createEl("td", { className: fieldClass(comparison.race.status), text: character.race, attrs: cellAttrs("Race") });
      const sagasTd = createEl("td", { className: fieldClass(comparison.sagas.status), text: character.sagas.join(", "), attrs: cellAttrs("Saga") });
      const affTd = createEl("td", { className: fieldClass(comparison.affiliations.status), text: character.affiliations.join(", "), attrs: cellAttrs("Affiliation") });
      const alignTd = createEl("td", { className: fieldClass(comparison.alignment.status), text: character.alignment, attrs: cellAttrs("Alignement") });

      const yearStatus = comparison.firstAppearanceYear.status;
      const yearCls = (yearStatus === "exact" ? "feedback-cell feedback-exact" : "feedback-cell feedback-none") + (yearStatus === "higher" ? " hint-up" : yearStatus === "lower" ? " hint-down" : "");
      const yearTd = createEl("td", { className: yearCls, text: renderYear(yearStatus, comparison.firstAppearanceYear.value), attrs: cellAttrs("Année") });

      const serieTd = createEl("td", { className: fieldClass(comparison.seriePremiereAppearance.status), text: String(comparison.seriePremiereAppearance.value || "-"), attrs: cellAttrs("Série") });

      const epStatus = comparison.episodePremiereAppearance.status;
      const epCls = (epStatus === "exact" ? "feedback-cell feedback-exact" : "feedback-cell feedback-none") + (epStatus === "higher" ? " hint-up" : epStatus === "lower" ? " hint-down" : "");
      const epTd = createEl("td", { className: epCls, text: renderEpisode(epStatus, comparison.episodePremiereAppearance.value), attrs: cellAttrs("Épisode") });

      row.append(imageCell, nameTd, raceTd, sagasTd, affTd, alignTd, yearTd, serieTd, epTd);
      tbody.append(row);
    });
  }

  table.append(tbody);
  scroll.append(table);
    // Ajouter l'indicateur de couleur
    const indicator = createEl("div", { className: "table-indicator" });
    indicator.append(
      createEl("div", {
        className: "indicator-item",
        html: '<div class="indicator-box indicator-exact"></div><span>Correct</span>'
      }),
      createEl("div", {
        className: "indicator-item",
        html: '<div class="indicator-box indicator-partial"></div><span>Partiel</span>'
      }),
      createEl("div", {
        className: "indicator-item",
        html: '<div class="indicator-box indicator-none"></div><span>Incorrect</span>'
      })
    );
  
    wrapper.append(scroll, indicator);
    return wrapper;
}