/* =====================================================================
   Judo Club du Lac — Script principal
   Menu mobile, en-tête au scroll, bannière, galerie lightbox, animations
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Menu mobile (burger) ---------- */
  var toggle   = document.querySelector(".nav__toggle");
  var backdrop = document.querySelector(".nav__backdrop");
  var links    = document.querySelectorAll(".nav__links a");

  function closeMenu() { document.body.classList.remove("menu-open"); if (toggle) toggle.setAttribute("aria-expanded", "false"); }
  function openMenu()  { document.body.classList.add("menu-open");    if (toggle) toggle.setAttribute("aria-expanded", "true"); }

  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.contains("menu-open") ? closeMenu() : openMenu();
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeMenu);
  links.forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenu(); closeLightbox(); } });

  /* ---------- Ombre de l'en-tête au défilement ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Fermeture de la bannière annonce ---------- */
  var announceClose = document.querySelector(".announce__close");
  if (announceClose) {
    announceClose.addEventListener("click", function () {
      var a = announceClose.closest(".announce");
      if (a) a.style.display = "none";
    });
  }

  /* ---------- Animations d'apparition au scroll ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Lightbox de la galerie historique ---------- */
  var lightbox = document.getElementById("lightbox");

  function closeLightbox() {
    if (lightbox) { lightbox.classList.remove("open"); document.body.style.overflow = ""; }
  }
  window.closeLightbox = closeLightbox;

  if (lightbox) {
    var lbImg  = lightbox.querySelector("[data-lb-img]");
    var lbDate = lightbox.querySelector("[data-lb-date]");
    var lbDesc = lightbox.querySelector("[data-lb-desc]");

    document.querySelectorAll(".event").forEach(function (ev) {
      ev.setAttribute("tabindex", "0");
      ev.setAttribute("role", "button");
      function open() {
        if (lbImg)  { lbImg.src = ev.getAttribute("data-full") || ev.querySelector("img").src; lbImg.alt = ev.getAttribute("data-date") || ""; }
        if (lbDate) lbDate.textContent = ev.getAttribute("data-date") || "";
        if (lbDesc) lbDesc.textContent = ev.getAttribute("data-desc") || "";
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
      }
      ev.addEventListener("click", open);
      ev.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.hasAttribute("data-lb-close")) closeLightbox();
    });
  }

  /* ---------- Année dynamique dans le pied de page ---------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
