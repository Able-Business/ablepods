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
