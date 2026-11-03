/* ==========================================================================
   Norah Almishdaq — Portfolio Scripts
   --------------------------------------------------------------------------
   1. Helpers
   2. Header state on scroll
   3. Mobile navigation menu
   4. Smooth scrolling for in-page links
   5. Active nav link (scroll spy)
   6. Scroll-reveal animations
   7. Interactive project cards (expand + cursor spotlight)
   8. Typing effect for the hero role
   9. Copy email to clipboard + toast
   10. Neural-network hero background (canvas)
   11. Footer year
   ========================================================================== */

(() => {
  "use strict";

  /* 1. HELPERS ============================================================ */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersReduced = () => reducedMotion.matches;

  /* 2. HEADER STATE ON SCROLL ============================================= */
  const header = $(".site-header");

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* 3. MOBILE NAVIGATION MENU ============================================= */
  const navToggle   = $("#navToggle");
  const navMenu     = $("#navMenu");
  const navBackdrop = $("#navBackdrop");
  const mobileQuery = window.matchMedia("(max-width: 860px)");

  const setMenu = (open) => {
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    navMenu.classList.toggle("is-open", open);
    navBackdrop.hidden = !open;
    document.body.classList.toggle("menu-open", open);

    // Move focus into the menu when it opens, back to the toggle when it closes
    if (open) {
      const firstLink = $(".nav__link", navMenu);
      firstLink && firstLink.focus({ preventScroll: true });
    }
  };

  const isMenuOpen = () => navToggle.getAttribute("aria-expanded") === "true";

  navToggle.addEventListener("click", () => setMenu(!isMenuOpen()));
  navBackdrop.addEventListener("click", () => setMenu(false));

  // Close on Escape and keep keyboard focus trapped inside the open menu
  document.addEventListener("keydown", (e) => {
    if (!isMenuOpen()) return;

    if (e.key === "Escape") {
      setMenu(false);
      navToggle.focus();
      return;
    }

    if (e.key === "Tab") {
      const focusables = [navToggle, ...$$(".nav__link", navMenu)];
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // If the viewport grows past the mobile breakpoint, reset the menu
  mobileQuery.addEventListener("change", (e) => {
    if (!e.matches && isMenuOpen()) setMenu(false);
  });

  /* 4. SMOOTH SCROLLING =================================================== */
  // CSS `scroll-behavior: smooth` is the baseline; this adds menu closing,
  // reduced-motion support, focus management and clean URL hashes.
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute("href");
    if (id.length < 2) return;

    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    if (isMenuOpen()) setMenu(false);

    target.scrollIntoView({
      behavior: prefersReduced() ? "auto" : "smooth",
      block: "start",
    });

    // Move focus for keyboard/screen-reader users without a second jump
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });

    history.pushState(null, "", id);
  });

  /* 5. ACTIVE NAV LINK (SCROLL SPY) ======================================= */
  const navLinks = $$(".nav__link");
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window) {
    // A thin horizontal band across the middle of the viewport decides
    // which section is "current".
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => spy.observe(section));

    // Clear highlight when back in the hero
    const heroSpy = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setActive(""),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    heroSpy.observe($("#hero"));
  }

  /* 6. SCROLL-REVEAL ANIMATIONS =========================================== */
  const revealEls = $$(".reveal");

  // Stagger siblings that share a parent (e.g. cards in a grid)
  revealEls.forEach((el) => {
    const siblings = $$(":scope > .reveal", el.parentElement);
    const index = siblings.indexOf(el);
    if (index > 0) el.style.setProperty("--delay", `${Math.min(index * 0.09, 0.45)}s`);
  });

  if ("IntersectionObserver" in window && !prefersReduced()) {
    const revealer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // animate once
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* 7. INTERACTIVE PROJECT CARDS ========================================== */
  $$(".project-card").forEach((card) => {
    const toggle = $(".project-card__toggle", card);
    const panel  = $(`#${toggle.getAttribute("aria-controls")}`);
    const label  = $("span", toggle);

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;
      label.textContent = open ? "Hide details" : "Show details";
      card.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Clicking anywhere on the card also toggles it (except on links / text selection)
    card.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      if (window.getSelection().toString()) return;
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    card.style.cursor = "pointer";

    // Cursor-following spotlight (feeds --mx / --my in CSS)
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });

  /* 8. TYPING EFFECT ====================================================== */
  const typedEl = $("#typedRole");

  if (typedEl && !prefersReduced()) {
    const fullText = typedEl.textContent.trim();
    // Screen readers get the full text immediately from a visually-hidden copy;
    // the animated span is hidden from assistive tech.
    const srCopy = document.createElement("span");
    srCopy.className = "sr-only";
    srCopy.textContent = fullText;
    typedEl.before(srCopy);
    typedEl.setAttribute("aria-hidden", "true");
    typedEl.textContent = "";

    let i = 0;
    const type = () => {
      typedEl.textContent = fullText.slice(0, ++i);
      if (i < fullText.length) setTimeout(type, 38 + Math.random() * 40);
    };
    setTimeout(type, 600);
  }

  /* 9. COPY EMAIL + TOAST ================================================= */
  const toast = $("#toast");
  let toastTimer;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  };

  $$(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        showToast("Email copied to clipboard");
      } catch {
        // Fallback for browsers / contexts without the async Clipboard API
        const field = document.createElement("textarea");
        field.value = value;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const ok = document.execCommand && document.execCommand("copy");
        field.remove();
        showToast(ok ? "Email copied to clipboard" : value);
      }
    });
  });

  /* 10. NEURAL-NETWORK HERO BACKGROUND ==================================== */
  const canvas = $("#heroCanvas");

  if (canvas && canvas.getContext) {
    const ctx  = canvas.getContext("2d");
    const hero = $("#hero");
    const pointer = { x: -9999, y: -9999 };

    let nodes = [];
    let width = 0;
    let height = 0;
    let rafId = null;
    let heroVisible = true;

    const LINK_DIST = 140;   // max distance for drawing a connection
    const MOUSE_DIST = 180;  // radius of the cursor's influence

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width  = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width  = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Node count scales with area, capped for performance
      const count = Math.min(90, Math.floor((width * height) / 16000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.8,
        hue: Math.random() < 0.65 ? "34, 211, 238" : "167, 139, 250", // cyan / violet
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Move nodes and bounce off edges
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width)  n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      // Connections between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(${a.hue}, ${(1 - dist / LINK_DIST) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Brighter links to the cursor
        const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (pd < MOUSE_DIST) {
          ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - pd / MOUSE_DIST) * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }

      // Nodes
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${n.hue}, 0.85)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      draw();
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (rafId || prefersReduced() || !heroVisible || document.hidden) return;
      rafId = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(rafId);
      rafId = null;
    };

    // Debounced resize
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if (prefersReduced()) draw();
      }, 150);
    });

    hero.addEventListener("pointermove", (e) => {
      const rect = hero.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    });
    hero.addEventListener("pointerleave", () => {
      pointer.x = pointer.y = -9999;
    });

    // Pause when the hero is off-screen or the tab is hidden (saves battery)
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        heroVisible ? start() : stop();
      }).observe(hero);
    }
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    reducedMotion.addEventListener("change", () => (prefersReduced() ? stop() : start()));

    resize();
    prefersReduced() ? draw() : start(); // static frame for reduced motion
  }

  /* 11. FOOTER YEAR ======================================================= */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
