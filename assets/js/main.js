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
  var bindLightboxEvent = null; /* défini plus bas, utilisé aussi par les événements récents */

  /* Badge « N photos » sur les événements multi-photos */
  function decoratePhotoCount(el) {
    var multi = el.getAttribute("data-photos");
    if (!multi) return;
    var n = multi.split("|").filter(function (s) { return s.trim(); }).length;
    if (n < 2 || el.querySelector(".photo-badge")) return;
    el.classList.add("has-photos");
    var target = el.querySelector(".card__media") || el;
    var badge = document.createElement("span");
    badge.className = "photo-badge";
    badge.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="14" height="14" rx="2"/><path d="M7 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2"/></svg>' + n + " photos";
    target.appendChild(badge);
  }

  function closeLightbox() {
    if (lightbox) { lightbox.classList.remove("open"); document.body.style.overflow = ""; }
  }
  window.closeLightbox = closeLightbox;

  if (lightbox) {
    var lbImg    = lightbox.querySelector("[data-lb-img]");
    var lbDate   = lightbox.querySelector("[data-lb-date]");
    var lbDesc   = lightbox.querySelector("[data-lb-desc]");
    var lbPrev   = lightbox.querySelector("[data-lb-prev]");
    var lbNext   = lightbox.querySelector("[data-lb-next]");
    var lbCount  = lightbox.querySelector("[data-lb-count]");
    var lbThumbs = lightbox.querySelector("[data-lb-thumbs]");

    var photos = [];   /* photos de l'événement ouvert */
    var index  = 0;    /* photo affichée */
    var lbAlt  = "";

    function renderPhoto() {
      if (lbImg) { lbImg.src = photos[index] || ""; lbImg.alt = lbAlt; }
      if (lbCount) lbCount.textContent = (index + 1) + " / " + photos.length;
      if (lbThumbs) {
        lbThumbs.querySelectorAll("img").forEach(function (t, i) {
          t.classList.toggle("active", i === index);
        });
        var act = lbThumbs.querySelectorAll("img")[index];
        if (act && act.scrollIntoView) act.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      }
    }

    function goTo(i) {
      if (!photos.length) return;
      index = (i + photos.length) % photos.length;
      renderPhoto();
    }

    function openEvent(ev) {
      var multi = ev.getAttribute("data-photos");
      photos = multi ? multi.split("|").map(function (s) { return s.trim(); }).filter(Boolean)
                     : [ev.getAttribute("data-full") || ev.querySelector("img").src];
      index = 0;
      lbAlt = ev.getAttribute("data-date") || "";
      if (lbDate) lbDate.textContent = ev.getAttribute("data-date") || "";
      if (lbDesc) lbDesc.textContent = ev.getAttribute("data-desc") || "";

      var several = photos.length > 1;
      lightbox.classList.toggle("multi", several);
      if (lbPrev)  lbPrev.style.display  = several ? "" : "none";
      if (lbNext)  lbNext.style.display  = several ? "" : "none";
      if (lbCount) lbCount.style.display = several ? "" : "none";
      if (lbThumbs) {
        lbThumbs.innerHTML = "";
        lbThumbs.style.display = several ? "" : "none";
        if (several) {
          photos.forEach(function (src, i) {
            var t = document.createElement("img");
            t.src = src; t.loading = "lazy"; t.alt = "";
            t.addEventListener("click", function (e) { e.stopPropagation(); goTo(i); });
            lbThumbs.appendChild(t);
          });
        }
      }
      renderPhoto();
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    bindLightboxEvent = function (el) {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.classList.add("card--event");
      el.addEventListener("click", function () { openEvent(el); });
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEvent(el); } });
      decoratePhotoCount(el);
    };
    document.querySelectorAll(".event, [data-recent-events] .card[data-full]").forEach(bindLightboxEvent);

    if (lbPrev) lbPrev.addEventListener("click", function (e) { e.stopPropagation(); goTo(index - 1); });
    if (lbNext) lbNext.addEventListener("click", function (e) { e.stopPropagation(); goTo(index + 1); });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open") || photos.length < 2) return;
      if (e.key === "ArrowLeft")  goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    });

    /* Navigation tactile (balayage gauche/droite) */
    var touchX = null;
    lightbox.addEventListener("touchstart", function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (touchX === null || photos.length < 2) { touchX = null; return; }
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) goTo(dx > 0 ? index - 1 : index + 1);
      touchX = null;
    }, { passive: true });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.hasAttribute("data-lb-close")) closeLightbox();
    });
  }

  /* ---------- Événements récents (accueil) ----------
     Les 2 derniers événements de historique.html sont chargés
     automatiquement : il suffit de mettre à jour l'historique. */
  var recent = document.querySelector("[data-recent-events]");
  if (recent && window.fetch && window.DOMParser) {
    fetch("historique.html").then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var evs = doc.querySelectorAll(".season .gallery .event");
      if (!evs.length) return;
      var cards = [];
      Array.prototype.slice.call(evs, 0, 2).forEach(function (ev) {
        var imgSrc = ev.getAttribute("data-full") || "";
        if (!imgSrc) { var im = ev.querySelector("img"); imgSrc = im ? im.getAttribute("src") : ""; }
        var card = document.createElement("article");
        card.className = "card reveal in";
        var media = document.createElement("div");
        media.className = "card__media";
        var img = document.createElement("img");
        img.loading = "lazy"; img.src = imgSrc; img.alt = ev.getAttribute("data-date") || "";
        media.appendChild(img);
        var body = document.createElement("div");
        body.className = "card__body";
        var date = document.createElement("span");
        date.className = "card__date";
        date.textContent = ev.getAttribute("data-date") || "";
        var p = document.createElement("p");
        p.textContent = ev.getAttribute("data-desc") || "";
        body.appendChild(date); body.appendChild(p);
        card.appendChild(media); card.appendChild(body);
        /* attributs nécessaires à la lightbox (photos multiples, texte) */
        ["data-full", "data-photos", "data-date", "data-desc"].forEach(function (a) {
          var v = ev.getAttribute(a);
          if (v) card.setAttribute(a, v);
        });
        if (bindLightboxEvent) bindLightboxEvent(card);
        cards.push(card);
      });
      if (cards.length) {
        recent.innerHTML = "";
        cards.forEach(function (c) { recent.appendChild(c); });
      }
    }).catch(function () { /* en cas d'échec, le contenu statique reste affiché */ });
  }

  /* ---------- Année dynamique dans le pied de page ---------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
