/* ==========================================================================
   FIT FREAK — main.js
   Preloader, Lenis smooth scroll, GSAP/ScrollTrigger reveals, custom cursor,
   navbar behaviour, trainer drag-carousel, membership tabs, FAQ accordion,
   gallery lightbox, contact form validation.
   ========================================================================== */
(function(){
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover:none), (pointer:coarse)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     GSAP registration
     --------------------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------------------------------------------------------------
     LENIS SMOOTH SCROLL
     --------------------------------------------------------------------- */
  let lenis;
  if (window.Lenis && !reduceMotion){
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", () => { if (window.ScrollTrigger) ScrollTrigger.update(); });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

  }

  function scrollToTarget(hash){
    const el = document.querySelector(hash);
    if (!el) return;
    if (lenis){ lenis.scrollTo(el, { offset: -90, duration: 1.2 }); }
    else { el.scrollIntoView({ behavior: "smooth" }); }
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href");
      if (hash.length > 1 && document.querySelector(hash)){
        e.preventDefault();
        closeMobileMenu();
        scrollToTarget(hash);
      }
    });
  });

  /* ---------------------------------------------------------------------
     PRELOADER
     --------------------------------------------------------------------- */
  const preloader = document.getElementById("preloader");
  const ringProgress = document.querySelector(".preloader-ring-progress");
  window.addEventListener("load", () => {
    if (window.gsap){
      gsap.to(ringProgress, {
        strokeDashoffset: 0, duration: 1.1, ease: "power2.out",
        onComplete: finishPreload
      });
    } else {
      setTimeout(finishPreload, 600);
    }
  });
  function finishPreload(){
    preloader.classList.add("is-done");
    document.body.style.overflow = "";
    runHeroIntro();
  }
  // safety fallback in case load event is delayed
  setTimeout(() => { if (!preloader.classList.contains("is-done")) finishPreload(); }, 3500);

  /* ---------------------------------------------------------------------
     CUSTOM CURSOR
     --------------------------------------------------------------------- */
  if (!isTouch){
    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    let mx = window.innerWidth/2, my = window.innerHeight/2;
    let rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });

    function ringLoop(){
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(ringLoop);
    }
    ringLoop();

    document.querySelectorAll("a, button, .service-card, .price-card, .trainer-card, .gallery-item, input, textarea, select").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
    });
  } else {
    document.body.style.cursor = "auto";
  }

  /* ---------------------------------------------------------------------
     MAGNETIC BUTTONS
     --------------------------------------------------------------------- */
  if (!isTouch && !reduceMotion){
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const relX = e.clientX - r.left - r.width/2;
        const relY = e.clientY - r.top - r.height/2;
        gsap.to(btn, { x: relX*0.28, y: relY*0.35, duration:0.4, ease:"power2.out" });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { x:0, y:0, duration:0.5, ease:"power3.out" });
      });
    });
  }

  /* ---------------------------------------------------------------------
     NAVBAR
     --------------------------------------------------------------------- */
  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".nav-link");
  const navIndicator = document.getElementById("navIndicator");

  function onScrollNav(){
    if (window.scrollY > 40) navbar.classList.add("is-scrolled");
    else navbar.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScrollNav);
  onScrollNav();

  function positionIndicator(link){
    if (!link) { navIndicator.style.opacity = 0; return; }
    navIndicator.style.opacity = 1;
    navIndicator.style.width = link.offsetWidth + "px";
    navIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
  }
  navIndicator.style.position = "absolute";
  navIndicator.style.bottom = "0";
  navIndicator.style.left = "0";
  navIndicator.style.height = "2px";
  navIndicator.style.background = "var(--ember-light)";
  navIndicator.style.borderRadius = "2px";
  navIndicator.style.transition = "transform .35s ease, width .35s ease, opacity .3s ease";

  const sections = ["home","about","services","trainers","membership","gallery","faq","contact"]
    .map((id) => document.getElementById(id)).filter(Boolean);

  function updateActiveNav(){
    let current = sections[0];
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    sections.forEach((s) => { if (s.offsetTop <= scrollPos) current = s; });
    navLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.nav === current.id));
    const activeLink = document.querySelector(`.nav-link[data-nav="${current.id}"]`);
    positionIndicator(activeLink);
  }
  window.addEventListener("scroll", updateActiveNav);
  window.addEventListener("resize", updateActiveNav);
  updateActiveNav();

  /* ---------------------------------------------------------------------
     MOBILE MENU
     --------------------------------------------------------------------- */
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuClose = document.getElementById("mobileMenuClose");

  function openMobileMenu(){
    mobileMenu.classList.add("is-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "Close menu");
    document.body.style.overflow = "hidden";
    mobileMenuClose.focus({preventScroll:true});
  }
  function closeMobileMenu(){
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.contains("is-open") ? closeMobileMenu() : openMobileMenu();
  });
  mobileMenuClose.addEventListener("click", closeMobileMenu);
  mobileMenu.setAttribute("aria-hidden", "true");
  document.querySelectorAll(".mobile-link, .mobile-menu-cta").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMobileMenu();
  });

  /* ---------------------------------------------------------------------
     HERO INTRO (single orchestrated reveal)
     --------------------------------------------------------------------- */
  function runHeroIntro(){
    if (!window.gsap) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(".hero-img", { scale: 1, duration: 1.6, ease: "power2.out" }, 0)
      .to(".hero-title-line", { y: "0%", duration: 1, stagger: 0.12 }, 0.15)
      .to(".hero-sub", { opacity: 1, y: 0, duration: 0.8 }, 0.6)
      .to(".hero-actions", { opacity: 1, y: 0, duration: 0.8 }, 0.75)
      .to(".hero-glass-chip", { opacity: 1, duration: 0.8, stagger: 0.1 }, 0.9);
  }
  // fallback: hero visible even if GSAP fails to load
  if (!window.gsap){
    document.querySelectorAll(".hero-title-line").forEach(el=>el.style.transform="translateY(0)");
    document.querySelector(".hero-sub").style.opacity = 1;
    document.querySelector(".hero-actions").style.opacity = 1;
  }

  /* ---------------------------------------------------------------------
     SCROLL REVEALS
     --------------------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger){
    gsap.utils.toArray("[data-reveal]").forEach((el, i) => {
      gsap.fromTo(el, { y: 34, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
        delay: (i % 4) * 0.06,
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    gsap.utils.toArray(".price-card, .timing-card, .faq-item, .trainer-card").forEach((el, i) => {
      gsap.fromTo(el, { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
        delay: (i % 6) * 0.05,
        scrollTrigger: { trigger: el, start: "top 92%" }
      });
    });

    // Section headers
    gsap.utils.toArray(".section-head, .section-head-left").forEach((el) => {
      gsap.fromTo(el, { y: 24, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%" }
      });
    });

    // Parallax on about images
    if (!reduceMotion){
      gsap.utils.toArray("[data-parallax]").forEach((el) => {
        gsap.to(el, {
          y: -40, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true }
        });
      });
    }
  } else {
    document.querySelectorAll("[data-reveal]").forEach(el => { el.style.opacity = 1; });
  }

  /* ---------------------------------------------------------------------
     TRAINERS — DRAG CAROUSEL
     --------------------------------------------------------------------- */
  const track = document.getElementById("trainersTrack");
  const progressBar = document.getElementById("trainersProgressBar");
  if (track){
    let isDown = false, startX = 0, scrollStart = 0;

    function updateProgress(){
      const max = track.scrollWidth - track.clientWidth;
      const pct = max > 0 ? (track.scrollLeft / max) : 0;
      progressBar.style.width = (16 + pct * 84) + "%";
    }
    track.addEventListener("scroll", updateProgress);
    updateProgress();

    track.addEventListener("pointerdown", (e) => {
      // Touch devices use the browser's native momentum scrolling.
      // The custom drag is intentionally mouse-only so mobile swipes stay buttery.
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      isDown = true;
      startX = e.clientX;
      scrollStart = track.scrollLeft;
      track.classList.add("is-dragging");
      track.setPointerCapture?.(e.pointerId);
    });
    track.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const delta = e.clientX - startX;
      if (Math.abs(delta) > 2) e.preventDefault();
      track.scrollLeft = scrollStart - delta;
    });
    function stopDrag(){
      isDown = false;
      track.classList.remove("is-dragging");
    }
    ["pointerup","pointerleave","pointercancel"].forEach(evt => track.addEventListener(evt, stopDrag));
  }

  /* ---------------------------------------------------------------------
     MEMBERSHIP TABS
     --------------------------------------------------------------------- */
  const tabsWrap = document.getElementById("membershipTabs");
  const thumb = document.getElementById("membershipThumb");
  const tabs = document.querySelectorAll(".membership-tab");
  const panels = document.querySelectorAll(".membership-panel");

  function moveThumb(tab){
    if (!tab || !thumb) return;
    // Capsule hugs the selected tab with ~1px breathing room on every side.
    const pad = 1;
    thumb.style.width = (tab.offsetWidth + pad * 2) + "px";
    thumb.style.height = (tab.offsetHeight + pad * 2) + "px";
    thumb.style.transform = `translate3d(${tab.offsetLeft - pad}px, ${tab.offsetTop - pad}px, 0)`;
  }

  function activateTab(tab){
    tabs.forEach((t) => { t.classList.remove("is-active"); t.setAttribute("aria-selected","false"); });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected","true");
    moveThumb(tab);
    const term = tab.dataset.term;
    panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === term));
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => activateTab(tab)));
  window.addEventListener("resize", () => {
    const active = document.querySelector(".membership-tab.is-active");
    if (active) moveThumb(active);
  });
  // initial thumb position after fonts/layout settle
  window.addEventListener("load", () => {
    const active = document.querySelector(".membership-tab.is-active");
    if (active) moveThumb(active);
  });

  /* ---------------------------------------------------------------------
     FAQ ACCORDION
     --------------------------------------------------------------------- */
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const answer = item.querySelector(".faq-answer");
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".faq-question").forEach((other) => {
        if (other !== btn){
          other.setAttribute("aria-expanded", "false");
          other.closest(".faq-item").querySelector(".faq-answer").style.maxHeight = null;
        }
      });

      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + "px";
    });
  });

  /* ---------------------------------------------------------------------
     GALLERY LIGHTBOX
     --------------------------------------------------------------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  document.querySelectorAll("[data-gallery]").forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
  });
  function closeLightbox(){
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeLightbox(); closeMobileMenu(); } });

  /* ---------------------------------------------------------------------
     CONTACT FORM VALIDATION
     --------------------------------------------------------------------- */
  const form = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");

  if (form){
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      const name = form.querySelector("#fieldName");
      const email = form.querySelector("#fieldEmail");
      const phone = form.querySelector("#fieldPhone");
      const interest = form.querySelector("#fieldInterest");

      valid = validateField(name, name.value.trim().length > 1) && valid;
      valid = validateField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) && valid;
      valid = validateField(phone, phone.value.trim().length >= 7) && valid;
      valid = validateField(interest, interest.value !== "") && valid;

      if (valid){
        formSuccess.classList.add("is-shown");
        form.reset();
        setTimeout(() => formSuccess.classList.remove("is-shown"), 5000);
      }
    });

    function validateField(field, isValid){
      const group = field.closest(".field-group");
      group.classList.toggle("has-error", !isValid);
      return isValid;
    }

    form.querySelectorAll("input, select, textarea").forEach((f) => {
      f.addEventListener("input", () => f.closest(".field-group").classList.remove("has-error"));
      f.addEventListener("change", () => f.closest(".field-group").classList.remove("has-error"));
    });
  }



  /* ---------------------------------------------------------------------
     PREMIUM ACCESSIBILITY / MEDIA POLISH
     --------------------------------------------------------------------- */
  document.querySelectorAll("img").forEach((img) => {
    if (!img.closest(".hero-media")) img.loading = "lazy";
    img.decoding = "async";
  });

  mobileMenu.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileMenu();
  });
})();
