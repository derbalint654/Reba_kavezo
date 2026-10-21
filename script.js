/* Réba Kávézó – bemutató oldal, minimális vanilla JS */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hiányzó képek: helyőrző a fájlnévvel ---------- */
  function markMissing(img) {
    var slot = img.closest("[data-img-slot]");
    if (slot) slot.classList.add("is-missing");
  }
  document.querySelectorAll("[data-img-slot] img").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) {
      markMissing(img);
    } else {
      img.addEventListener("error", function () { markMissing(img); }, { once: true });
    }
  });

  /* ---------- Fejléc: háttér görgetéskor ---------- */
  var header = document.getElementById("fejlec");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobil menü ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("fomenu");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  /* ---------- Aktív menüpont + megjelenő elemek ---------- */
  if ("IntersectionObserver" in window) {
    var links = {};
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (link && entry.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("is-active"); });
          link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { sectionObserver.observe(s); });

    if (!reduceMotion) {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

      document.querySelectorAll(".reveal").forEach(function (el) {
        // egy rácson belül kis lépcsőzés
        var siblings = el.parentElement.querySelectorAll(":scope > .reveal");
        var index = Array.prototype.indexOf.call(siblings, el);
        if (index > 0) el.style.transitionDelay = Math.min(index, 5) * 80 + "ms";
        revealObserver.observe(el);
      });
    } else {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
    }
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Mai nap kiemelése a nyitvatartásban ---------- */
  var today = document.querySelector('.hours-table tr[data-day="' + new Date().getDay() + '"]');
  if (today) today.classList.add("is-today");

  /* ---------- Lightbox ---------- */
  var dialog = document.getElementById("lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;

  var lbImg = dialog.querySelector("img");
  var lbCaption = dialog.querySelector("figcaption");
  var buttons = Array.prototype.slice.call(document.querySelectorAll(".g-btn"));
  var current = 0;

  function available() {
    return buttons.filter(function (b) { return !b.closest(".is-missing"); });
  }

  function show(btn) {
    var img = btn.querySelector("img");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = img.alt;
    current = available().indexOf(btn);
  }

  function step(dir) {
    var list = available();
    if (!list.length) return;
    current = (current + dir + list.length) % list.length;
    show(list[current]);
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.closest(".is-missing")) return;
      show(btn);
      dialog.showModal();
    });
  });

  dialog.querySelector(".lb-close").addEventListener("click", function () { dialog.close(); });
  dialog.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
  dialog.querySelector(".lb-next").addEventListener("click", function () { step(1); });

  // kattintás a sötét háttérre: bezár
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  dialog.addEventListener("close", function () { lbImg.removeAttribute("src"); });
})();
