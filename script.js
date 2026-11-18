/* ============================================================
   Arlo - interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---- Nav: solid background on scroll ---- */
  const nav = document.getElementById("nav");

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 60);
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

  /* ---- Floor plans: tap to view full size ---- */
  const dialog = document.getElementById("planDialog");
  if (dialog && dialog.showModal) {
    const dImg = document.getElementById("planDialogImg");
    document.querySelectorAll(".plan-zoom").forEach((btn) =>
      btn.addEventListener("click", () => {
        const img = btn.querySelector("img");
        dImg.src = img.currentSrc || img.src;
        dImg.alt = img.alt;
        dialog.showModal();
        // On phones the plan is wider than the screen; start in the middle
        const sc = document.getElementById("planDialogScroll");
        const centre = () => { sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2; sc.scrollTop = 0; };
        if (dImg.complete) centre(); else dImg.onload = centre;
        document.body.classList.add("no-scroll");
      })
    );
    dialog.querySelector(".plan-dialog-close").addEventListener("click", () => dialog.close());
    // Close when tapping outside the plan
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => document.body.classList.remove("no-scroll"));
  } else {
    document.querySelectorAll(".plan-zoom .zoom-hint").forEach((h) => h.remove());
  }

  /* ---- Lead form: submit ---- */
  const form = document.getElementById("leadForm");
  if (form) {
    /* ---- "Ask about this plan" fills the comments with that plan and prompts ---- */
    const msg = form.querySelector("#message");
    const PLAN_LINE = /^I'd like a quote for the .+ plan.*$/m;
    document.querySelectorAll(".model-link").forEach((link) =>
      link.addEventListener("click", () => {
        const card = link.closest(".model-card");
        const name = card.querySelector("h3").textContent.trim();
        const specs = card.querySelector(".model-purpose-tag").textContent.replace(/\s*·\s*/g, ", ").trim();
        const line = "I'd like a quote for the " + name + " plan (" + specs + ").";
        const current = msg.value.trim();
        if (!current) {
          msg.value = line + "\n\nProperty address: \nApprox. block size: \nWhat it's for (rental, family, studio): \nAnything else we should know: ";
        } else if (PLAN_LINE.test(msg.value)) {
          msg.value = msg.value.replace(PLAN_LINE, line);
        } else {
          msg.value = line + "\n\n" + msg.value;
        }
        // Put the cursor in the first empty field so they can start typing
        const next = [...form.querySelectorAll("#name, #email, #postcode")].find((el) => !el.value.trim()) || msg;
        setTimeout(() => next.focus({ preventScroll: true }), 0);
      })
    );

    /* ---- Send to Formspree; show a real error if it fails ---- */
    const formError = document.getElementById("formError");
    const success = document.getElementById("formSuccess");
    const successNote = document.getElementById("formSuccessNote");
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitLabel = submitBtn.innerHTML;
    const FALLBACK = "Something went wrong sending your request. Please try again, or email info@ablebusiness.com.au.";

    function send(data) {
      return fetch(form.action, { method: "POST", headers: { Accept: "application/json" }, body: data });
    }
    function done(note) {
      form.querySelector(".form-fields").style.display = "none";
      successNote.textContent = note || "";
      success.classList.add("show");
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      formError.textContent = "";
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      try {
        const res = await send(new FormData(form));
        if (res.ok) return done();
        const data = await res.json().catch(() => null);
        formError.textContent = data && data.errors && data.errors.length ? data.errors.map((x) => x.message).join(", ") : FALLBACK;
      } catch (err) {
        formError.textContent = FALLBACK;
      }
      submitBtn.disabled = false;
      submitBtn.innerHTML = submitLabel;
    });
  }
})();
