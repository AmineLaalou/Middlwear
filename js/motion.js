/* MIDDLWEAR — effets de mouvement (GSAP + Lenis)
   Chaque effet est indépendant et se désactive seul si sa bibliothèque manque :
   sans GSAP, sans Lenis ou en "prefers-reduced-motion", le site retombe
   exactement sur son comportement CSS d'origine. */

const MWMotion = (() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const hasGsap = typeof gsap !== "undefined";
  const hasST = hasGsap && typeof ScrollTrigger !== "undefined";

  let lenis = null;

  /* ---------- 1. Défilement lissé ---------- */
  // Lenis donne la "sensation" du scroll, ScrollTrigger déclenche ce qui s'y passe.
  function smoothScroll() {
    if (reduced || typeof Lenis === "undefined") return;

    lenis = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.6 });
    const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    if (hasST) lenis.on("scroll", ScrollTrigger.update);

    // Le site fige déjà le fond avec .modal-open / .intro-active ; sans ça,
    // Lenis continuerait de faire défiler la page derrière une modale ouverte.
    const sync = () => {
      const locked = document.body.classList.contains("modal-open")
        || document.body.classList.contains("intro-active");
      locked ? lenis.stop() : lenis.start();
    };
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    sync();
  }

  /* ---------- 2. Titre du hero révélé ligne par ligne ---------- */
  function heroHeadline() {
    if (reduced || !hasGsap || typeof SplitText === "undefined") return;
    const h1 = document.querySelector(".hero h1");
    if (!h1) return;

    // "mask" enferme chaque ligne dans un cache : elle glisse depuis le bas
    // au lieu d'apparaître en fondu — bien plus net sur un titre court.
    const split = new SplitText(h1, { type: "lines", mask: "lines" });

    // SplitText masque les lignes aux lecteurs d'écran et reporte le texte en
    // aria-label ; le <br> du titre n'y laisse aucune espace ("Désolé,on casse").
    const lu = h1.getAttribute("aria-label");
    if (lu) h1.setAttribute("aria-label", lu.replace(/,(\S)/g, ", $1"));

    gsap.from(split.lines, {
      yPercent: 115, opacity: 0, duration: 1, ease: "power4.out", stagger: .11, delay: .15
    });
  }

  /* ---------- 3. Le bandeau réagit à la vitesse de défilement ---------- */
  function marqueeVelocity() {
    if (reduced || !hasGsap) return;
    const wrap = document.querySelector(".marquee");
    if (!wrap) return;

    // On incline le conteneur, jamais la piste : celle-ci est déjà animée en
    // CSS via transform, deux transforms sur le même élément se écraseraient.
    const skewTo = gsap.quickTo(wrap, "skewX", { duration: .5, ease: "power3.out" });
    let last = window.scrollY, idle = 0;

    const onScroll = () => {
      const v = window.scrollY - last;
      last = window.scrollY;
      skewTo(Math.max(-7, Math.min(7, v * .28)));
      clearTimeout(idle);
      idle = setTimeout(() => skewTo(0), 140);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 4. Boutons magnétiques ---------- */
  function magnetic() {
    if (reduced || coarse || !hasGsap) return;
    document.querySelectorAll(".btn-primary").forEach((el) => {
      const x = gsap.quickTo(el, "x", { duration: .4, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: .4, ease: "power3.out" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * .32);
        y((e.clientY - r.top - r.height / 2) * .42);
      });
      el.addEventListener("mouseleave", () => { x(0); y(0); });
    });
  }

  /* ---------- 5. Jauge de progression de lecture ---------- */
  function progressBar() {
    if (reduced || !hasST) return;
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
    gsap.to(bar, {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: .3 }
    });
  }

  /* ---------- 6. Profondeur du hero au défilement ---------- */
  function heroParallax() {
    if (reduced || !hasST) return;
    const scene = document.querySelector(".hero-scene");
    const copy = document.querySelector(".hero-grid > div:first-child");
    if (!scene) return;

    // La scène s'échappe plus vite que le texte : l'écart crée la profondeur.
    gsap.to(scene, {
      yPercent: -17, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .5 }
    });
    if (copy) {
      gsap.to(copy, {
        yPercent: 7, opacity: .35, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .5 }
      });
    }
  }

  function init() {
    smoothScroll();
    heroHeadline();
    marqueeVelocity();
    magnetic();
    progressBar();
    heroParallax();
  }

  return { init, get lenis() { return lenis; } };
})();
