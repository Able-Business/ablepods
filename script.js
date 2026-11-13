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

  /* ---- Lead form: submit ---- */
  const form = document.getElementById("leadForm");
  if (form) {
    /* ---- Attachments: photos and PDFs, max 5 files of 10MB ---- */
    const MAX_FILES = 5;
    const MAX_BYTES = 10 * 1024 * 1024;
    const ALLOWED = /\.(jpe?g|png|heic|heif|pdf)$/i;
    const fileInput = document.getElementById("files");
    const dropzone = document.getElementById("dropzone");
    const fileList = document.getElementById("fileList");
    const fileError = document.getElementById("filesError");
    let files = [];

    function formatSize(bytes) {
      return bytes < 1024 * 1024
        ? Math.max(1, Math.round(bytes / 1024)) + "KB"
        : (bytes / (1024 * 1024)).toFixed(1) + "MB";
    }

    function syncFiles() {
      // Keep the real input in step with the list so the files submit with the form
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));
      fileInput.files = dt.files;

      fileList.innerHTML = "";
      files.forEach((f, i) => {
        const li = document.createElement("li");
        const name = document.createElement("span");
        name.className = "fname";
        name.textContent = f.name;
        const size = document.createElement("span");
        size.className = "fsize";
        size.textContent = formatSize(f.size);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", "Remove " + f.name);
        remove.addEventListener("click", () => {
          files.splice(i, 1);
          fileError.textContent = "";
          syncFiles();
        });
        li.append(name, size, remove);
        fileList.appendChild(li);
      });
    }

    function addFiles(incoming) {
      const problems = [];
      Array.from(incoming).forEach((f) => {
        if (!ALLOWED.test(f.name)) problems.push(f.name + " is not a JPG, PNG, HEIC or PDF.");
        else if (f.size > MAX_BYTES) problems.push(f.name + " is over 10MB.");
        else if (files.length >= MAX_FILES) problems.push("You can attach up to " + MAX_FILES + " files.");
        else if (!files.some((x) => x.name === f.name && x.size === f.size)) files.push(f);
      });
      fileError.textContent = [...new Set(problems)].join(" ");
      syncFiles();
    }

    fileInput.addEventListener("change", () => addFiles(fileInput.files));

    ["dragenter", "dragover"].forEach((t) =>
      dropzone.addEventListener(t, (e) => {
        e.preventDefault();
        dropzone.classList.add("drag");
      })
    );
    ["dragleave", "drop"].forEach((t) =>
      dropzone.addEventListener(t, () => dropzone.classList.remove("drag"))
    );
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      addFiles(e.dataTransfer.files);
    });

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
        // If attachments were refused, send the details without them
        if (files.length) {
          const lite = new FormData(form);
          lite.delete("attachments");
          const res2 = await send(lite);
          if (res2.ok) return done("Your attachments could not be uploaded. Please email them to info@ablebusiness.com.au.");
        }
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
