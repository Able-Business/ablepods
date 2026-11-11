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

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.querySelector(".form-fields").style.display = "none";
      document.getElementById("formSuccess").classList.add("show");
    });
  }
})();
