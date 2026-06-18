/* ============================================================
   AblePods - interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- Nav: solid background on scroll ---- */
  const nav = document.getElementById("nav");
  const stickyBar = document.getElementById("stickyBar");
  const hero = document.getElementById("top");

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 60);

    // Show sticky bar once past the hero, hide near the quote form
    const heroH = hero ? hero.offsetHeight : 600;
    const quote = document.getElementById("quote");
    const quoteTop = quote ? quote.getBoundingClientRect().top : Infinity;
    const show = y > heroH * 0.6 && quoteTop > 240;
    stickyBar.classList.toggle("show", show);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---- Model filtering (shared by purpose cards + pills) ---- */
  const cards = Array.from(document.querySelectorAll(".model-card"));
  const pills = Array.from(document.querySelectorAll(".pill"));
  const purposeCards = Array.from(document.querySelectorAll(".purpose-card"));

  function applyFilter(filter) {
    cards.forEach((card) => {
      const purposes = card.getAttribute("data-purpose") || "";
      const match = filter === "all" || purposes.split(/\s+/).includes(filter);
      card.classList.toggle("hidden", !match);
    });
    pills.forEach((p) => p.classList.toggle("active", p.dataset.filter === filter));
    purposeCards.forEach((c) =>
      c.classList.toggle("active", c.dataset.purpose === filter)
    );
  }

  pills.forEach((p) =>
    p.addEventListener("click", () => applyFilter(p.dataset.filter))
  );

  purposeCards.forEach((c) => {
    const select = () => {
      const isActive = c.classList.contains("active");
      applyFilter(isActive ? "all" : c.dataset.purpose);
      if (!isActive) {
        document.getElementById("models").scrollIntoView({ behavior: "smooth" });
      }
    };
    c.addEventListener("click", select);
    c.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select();
      }
    });
  });

  /* ---- Lead form: progress + submit ---- */
  const form = document.getElementById("leadForm");
  if (form) {
    const fsBars = Array.from(form.querySelectorAll(".form-steps .fs"));

    function updateProgress() {
      let done = 0;
      if (form.name.value.trim()) done = 1;
      if (form.email.value.trim() && form.postcode.value.trim()) done = 2;
      if (form.message.value.trim()) done = 3;
      fsBars.forEach((b, i) => b.classList.toggle("on", i < Math.max(done, 1)));
    }
    form.addEventListener("input", updateProgress);
    form.addEventListener("change", updateProgress);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.querySelector(".form-fields").style.display = "none";
      document.getElementById("formSuccess").classList.add("show");
      fsBars.forEach((b) => b.classList.add("on"));
    });
  }

  /* ---- Mobile nav toggle (simple jump to quote) ---- */
  const toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      document.getElementById("quote").scrollIntoView({ behavior: "smooth" });
    });
  }
})();
