/* MIDDLWEAR — couche visuelle 3D
   1) Scène hero WebGL (Three.js si disponible, sinon repli CSS 3D)
   2) Champ de particules en fond (canvas 2D natif, zéro dépendance)
   3) Tilt 3D des cartes au survol
   4) Halo de curseur
   Tout dégrade proprement si le CDN n'est pas joignable ou si
   l'utilisateur préfère les animations réduites. */

const MWVisuals = (() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Scène hero ---------- */
  function initHero() {
    const canvas = document.getElementById("hero-canvas");
    const fallback = document.getElementById("hero-fallback");
    if (!canvas) return;

    const hasThree = typeof window.THREE !== "undefined";
    if (!hasThree || reduced) {
      canvas.style.display = "none";
      if (fallback) fallback.style.display = "grid";
      return;
    }

    try {
      const THREE = window.THREE;
      const parent = canvas.parentElement;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.z = 5.2;

      // Icosaèdre en fil de fer — évoque un réseau / hub logistique
      const geo = new THREE.IcosahedronGeometry(1.62, 1);
      const wire = new THREE.MeshBasicMaterial({
        color: 0x22f0c4, wireframe: true, transparent: true, opacity: 0.55
      });
      const core = new THREE.Mesh(geo, wire);
      scene.add(core);

      // Coque interne translucide
      const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.5, 2),
        new THREE.MeshBasicMaterial({ color: 0x8b7cff, transparent: true, opacity: 0.07 })
      );
      scene.add(shell);

      // Anneau orbital
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.45, 0.012, 8, 120),
        new THREE.MeshBasicMaterial({ color: 0x8b7cff, transparent: true, opacity: 0.5 })
      );
      ring.rotation.x = Math.PI / 2.35;
      scene.add(ring);

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(2.9, 0.008, 8, 120),
        new THREE.MeshBasicMaterial({ color: 0x22f0c4, transparent: true, opacity: 0.32 })
      );
      ring2.rotation.x = Math.PI / 1.7;
      ring2.rotation.y = 0.4;
      scene.add(ring2);

      // Nuage de points satellites
      const count = 260;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 2.1 + Math.random() * 1.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);
      }
      const pg = new THREE.BufferGeometry();
      pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const points = new THREE.Points(
        pg,
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.028, transparent: true, opacity: 0.62 })
      );
      scene.add(points);

      function resize() {
        const w = parent.clientWidth;
        const h = parent.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();
      window.addEventListener("resize", resize);

      // Parallaxe souris
      let mx = 0, my = 0, tx = 0, ty = 0;
      window.addEventListener("mousemove", (e) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 0.55;
        ty = (e.clientY / window.innerHeight - 0.5) * 0.55;
      });

      let raf;
      let visible = true;
      document.addEventListener("visibilitychange", () => { visible = !document.hidden; });

      const clock = new THREE.Clock();
      function loop() {
        raf = requestAnimationFrame(loop);
        if (!visible) return;
        const t = clock.getElapsedTime();

        mx += (tx - mx) * 0.045;
        my += (ty - my) * 0.045;

        core.rotation.y = t * 0.22 + mx;
        core.rotation.x = t * 0.1 + my;
        shell.rotation.y = -t * 0.15;
        shell.rotation.z = t * 0.08;
        points.rotation.y = t * 0.05 + mx * 0.5;
        points.rotation.x = -t * 0.03;
        ring.rotation.z = t * 0.3;
        ring2.rotation.z = -t * 0.22;

        const pulse = 1 + Math.sin(t * 1.25) * 0.035;
        core.scale.setScalar(pulse);

        renderer.render(scene, camera);
      }
      loop();
      return () => { cancelAnimationFrame(raf); };
    } catch (err) {
      canvas.style.display = "none";
      if (fallback) fallback.style.display = "grid";
    }
  }

  /* ---------- 2. Fond de particules (canvas 2D natif) ---------- */
  function initBackground() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w, h, dots = [];
    const DPR = Math.min(window.devicePixelRatio, 2);

    function setup() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const density = Math.min(80, Math.floor((w * h) / 20000));
      dots = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.3 + 0.4
      }));
    }
    setup();
    window.addEventListener("resize", setup);

    let visible = true;
    document.addEventListener("visibilitychange", () => { visible = !document.hidden; });

    function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,.22)";
        ctx.fill();
      }
      // liaisons
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 16000) {
            const a = (1 - dist2 / 16000) * 0.14;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(34,240,196,${a})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }
    frame();
  }

  /* ---------- 3. Tilt 3D ---------- */
  function bindTilt(root = document) {
    if (reduced) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    root.querySelectorAll("[data-tilt]").forEach((el) => {
      if (el.dataset.tiltBound) return;
      el.dataset.tiltBound = "1";
      const max = Number(el.dataset.tilt) || 9;

      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", px * 100 + "%");
        el.style.setProperty("--my", py * 100 + "%");
        el.style.transform =
          `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-5px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------- 4. Halo de curseur ---------- */
  function initCursor() {
    if (reduced || window.matchMedia("(pointer: coarse)").matches) return;
    const glow = document.querySelector(".cursor-glow");
    if (!glow) return;
    let x = 0, y = 0, cx = 0, cy = 0;
    document.body.classList.add("cursor-on");
    window.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; });
    (function follow() {
      requestAnimationFrame(follow);
      cx += (x - cx) * 0.1;
      cy += (y - cy) * 0.1;
      glow.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    })();
  }

  /* ---------- 5. Révélation au scroll ---------- */
  function initReveal(root = document) {
    const els = root.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    els.forEach((el) => io.observe(el));
  }

  return { initHero, initBackground, bindTilt, initCursor, initReveal };
})();
