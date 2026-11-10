(() => {
  "use strict";
  const data = window.PORTFOLIO_DATA,
    grid = document.getElementById("weekGrid"),
    filters = document.getElementById("filters"),
    search = document.getElementById("search"),
    modal = document.getElementById("detailModal"),
    modalContent = document.getElementById("modalContent");
  let category = "Todos",
    lastFocus = null;
  const escape = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  document.getElementById("evidenceCount").textContent = data.docs.length;
  const cats = [
    "Todos",
    "Fundamentos",
    "Procesos",
    "Personas",
    "Liderazgo",
    "Responsabilidad",
    "Estrategia",
    "Integración",
  ];
  filters.innerHTML = cats
    .map(
      (c) =>
        `<button type="button" class="filter ${c === "Todos" ? "active" : ""}" data-category="${c}">${c}</button>`,
    )
    .join("");
  function draw() {
    const q = search.value.toLocaleLowerCase("es").trim();
    const items = data.weeks.filter(
      (w) =>
        (category === "Todos" || w.category === category) &&
        `${w.n} ${w.title} ${w.concept} ${w.category}`
          .toLocaleLowerCase("es")
          .includes(q),
    );
    grid.innerHTML = items
      .map(
        (w) =>
          `<button type="button" class="week-card" data-week="${w.n}" id="semana-${w.n}" aria-label="Abrir semana ${w.n}: ${escape(w.title)}"><div class="card-top"><span class="week-number">SEMANA ${String(w.n).padStart(2, "0")}</span><span class="week-category">${escape(w.category)}</span></div><h3>${escape(w.title)}</h3><p>${escape(w.concept)}</p><div class="card-bottom"><span>${w.docs.length ? `${w.docs.length} documento(s) disponible(s)` : "VER APRENDIZAJE"}</span><b>↗</b></div></button>`,
      )
      .join("");
    document.getElementById("noResults").hidden = items.length > 0;
  }
  function openWeek(n) {
    const w = data.weeks.find((w) => w.n === Number(n));
    if (!w) return;
    lastFocus = document.activeElement;
    const evidence = w.docs.length
      ? `<div class="detail-section"><h3>04 · Evidencias de aprendizaje</h3><div class="evidence-list">${w.docs
          .map(
            (d) =>
              `<article class="evidence-card"><div class="evidence-heading"><span class="evidence-icon">▤</span><div><h4>${escape(d.name)}</h4><p>${escape(d.description)}</p></div></div><div class="evidence-actions"><button type="button" class="evidence-view" data-evidence-view="${escape(d.url)}" data-evidence-title="${escape(d.name)}">Ver evidencia</button><a class="evidence-download" href="${encodeURI(d.url)}" download="${escape(d.name)}.pdf">Descargar PDF</a></div></article>`,
          )
          .join("")}</div></div>`
      : "";
    modalContent.innerHTML = `<span class="detail-kicker">SEMANA ${String(w.n).padStart(2, "0")} / ${escape(w.category.toUpperCase())}</span><h2 id="modalTitle">${escape(w.title)}</h2><div class="detail-section"><h3>01 · Concepto clave</h3><p>${escape(w.concept)}</p></div><div class="detail-section"><h3>02 · ¿Qué aprendí?</h3><p>${escape(w.learn)}</p></div><div class="detail-section"><h3>03 · ¿Cómo lo aplico profesionalmente?</h3><p>${escape(w.apply)}</p></div>${evidence}<div class="detail-actions"><button type="button" id="prevWeek" ${w.n === 1 ? "disabled" : ""}>← Anterior</button><button type="button" id="nextWeek" ${w.n === 16 ? "disabled" : ""}>Siguiente →</button></div>`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("modalClose").focus();
    document
      .getElementById("prevWeek")
      .addEventListener("click", () => openWeek(w.n - 1));
    document
      .getElementById("nextWeek")
      .addEventListener("click", () => openWeek(w.n + 1));
  }
  const evidenceModal = document.getElementById("evidenceModal"),
    evidenceFrame = document.getElementById("evidenceFrame"),
    evidenceTitle = document.getElementById("evidenceTitle"),
    evidenceFallback = document.getElementById("evidenceFallback"),
    evidenceDownload = document.getElementById("evidenceDownload");
  let evidenceFocus = null;
  function openEvidence(url, title) {
    evidenceFocus = document.activeElement;
    const encodedUrl = encodeURI(url);
    evidenceTitle.textContent = title;
    evidenceFrame.src = encodedUrl;
    evidenceFallback.href = encodedUrl;
    evidenceDownload.href = encodedUrl;
    evidenceDownload.download = `${title}.pdf`;
    evidenceModal.classList.add("open");
    evidenceModal.setAttribute("aria-hidden", "false");
    evidenceModal.querySelector(".evidence-modal-close").focus();
  }
  function closeEvidence() {
    evidenceModal.classList.remove("open");
    evidenceModal.setAttribute("aria-hidden", "true");
    evidenceFrame.src = "about:blank";
    if (evidenceFocus && evidenceFocus.isConnected) evidenceFocus.focus();
  }
  function closeWeek() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.isConnected) lastFocus.focus();
  }
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-category]");
    if (!btn) return;
    category = btn.dataset.category;
    filters
      .querySelectorAll(".filter")
      .forEach((b) => b.classList.toggle("active", b === btn));
    draw();
  });
  search.addEventListener("input", draw);
  grid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-week]");
    if (b) openWeek(b.dataset.week);
  });
  document.getElementById("modalClose").addEventListener("click", closeWeek);
  modal.addEventListener("click", (e) => {
    if (e.target.dataset.close) closeWeek();
  });
  modal.addEventListener("click", (e) => {
    const button = e.target.closest("[data-evidence-view]");
    if (button)
      openEvidence(button.dataset.evidenceView, button.dataset.evidenceTitle);
  });
  document
    .getElementById("evidenceModalClose")
    .addEventListener("click", closeEvidence);
  evidenceModal.addEventListener("click", (e) => {
    if (e.target.dataset.close) closeEvidence();
  });
  document.querySelectorAll(".competency-grid a").forEach((a) =>
    a.addEventListener("click", (e) => {
      const n = Number(a.hash.replace("#semana-", ""));
      if (n) {
        e.preventDefault();
        openWeek(n);
      }
    }),
  );
  const archive = document.getElementById("archiveGrid");
  archive.innerHTML = data.docs
    .map(
      (d) =>
        `<a class="archive-item" href="${encodeURI(d.url)}" target="_blank" rel="noopener"><span class="file-icon">▤</span><span class="file-name">${escape(d.name)}</span><span class="file-arrow">↗</span></a>`,
    )
    .join("");
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (evidenceModal.classList.contains("open")) closeEvidence();
      else closeWeek();
    }
  });
  const toggle = document.getElementById("menuToggle"),
    nav = document.getElementById("nav");
  toggle.addEventListener("click", () => {
    const on = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(on));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
  draw();
})();
