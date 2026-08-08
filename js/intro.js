/* MIDDLWEAR — intro 3D
   Six objets représentant les catégories du catalogue (ordinateur, montre
   connectée, drone, trottinette, écouteurs, casque VR) surgissent du fond de
   la scène et se rangent en orbite autour du logo, qui reste au premier plan.

   Le canvas est volontairement placé DERRIÈRE le logo (z-index) : quelle que
   soit la position des objets, le logo ne peut jamais être masqué.

   Dégradation : sans Three.js, sans GSAP, ou en "prefers-reduced-motion",
   init() renvoie false et l'intro CSS d'origine reste seule à l'écran. */

const MWIntro = (() => {
  "use strict";

  const TEAL = 0x22f0c4;
  const VIOLET = 0x8b7cff;
  const BODY = 0x2a3357; // assez clair pour se détacher du fond très sombre de l'intro

  let renderer, scene, camera, orbit, canvas;
  let raf = 0, started = 0, alive = false;
  let pieces = [];
  let px = 0, py = 0, tx = 0, ty = 0; // parallaxe lissée

  const mobile = window.matchMedia("(max-width: 720px)").matches;

  // Un onglet encore non composité peut renvoyer 0 : sans repli, camera.aspect
  // devient NaN et plus rien ne s'affiche même après l'apparition du viewport.
  function viewport() {
    return {
      w: window.innerWidth || document.documentElement.clientWidth || 1280,
      h: window.innerHeight || document.documentElement.clientHeight || 720
    };
  }

  function usable() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (typeof THREE === "undefined" || typeof gsap === "undefined") return false;
    // Un contexte WebGL indisponible (vieux mobile, GPU bloqué) doit rester silencieux.
    try {
      const c = document.createElement("canvas");
      return Boolean(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch { return false; }
  }

  /* ---------- Matériaux ---------- */
  const metal = (c = BODY) => new THREE.MeshStandardMaterial({ color: c, metalness: .78, roughness: .34 });
  const glow = (c) => new THREE.MeshStandardMaterial({
    color: c, emissive: c, emissiveIntensity: .85, metalness: .3, roughness: .5
  });
  function edges(geo, color) {
    return new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: .85 })
    );
  }

  /* ---------- Les six objets, en primitives ---------- */
  function laptop() {
    const g = new THREE.Group();
    const baseGeo = new THREE.BoxGeometry(1.6, .09, 1.1);
    const base = new THREE.Mesh(baseGeo, metal());
    base.add(edges(baseGeo, TEAL));
    const screenGeo = new THREE.BoxGeometry(1.6, 1.05, .06);
    const screen = new THREE.Mesh(screenGeo, metal());
    screen.add(edges(screenGeo, TEAL));
    screen.position.set(0, .52, -.52);
    screen.rotation.x = -.28;
    const lit = new THREE.Mesh(new THREE.PlaneGeometry(1.44, .9), glow(TEAL));
    lit.material.emissiveIntensity = .5;
    lit.position.z = .04;
    screen.add(lit);
    g.add(base, screen);
    return g;
  }

  function watch() {
    const g = new THREE.Group();
    const caseGeo = new THREE.BoxGeometry(.72, .86, .18);
    const body = new THREE.Mesh(caseGeo, metal());
    body.add(edges(caseGeo, VIOLET));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(.56, .68), glow(VIOLET));
    face.material.emissiveIntensity = .55;
    face.position.z = .1;
    const strap = new THREE.Mesh(new THREE.TorusGeometry(.62, .075, 8, 28, Math.PI * 1.25), metal(0x0e1322));
    strap.rotation.z = Math.PI * .38;
    g.add(body, face, strap);
    return g;
  }

  function drone() {
    const g = new THREE.Group();
    const coreGeo = new THREE.BoxGeometry(.62, .2, .62);
    const core = new THREE.Mesh(coreGeo, metal());
    core.add(edges(coreGeo, TEAL));
    g.add(core);
    [[.62, .62], [-.62, .62], [.62, -.62], [-.62, -.62]].forEach(([x, z]) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .82, 6), metal(0x0e1322));
      arm.position.set(x / 2, 0, z / 2);
      arm.rotation.set(Math.PI / 2, 0, Math.atan2(x, z));
      const rotor = new THREE.Mesh(new THREE.TorusGeometry(.28, .028, 6, 20), glow(TEAL));
      rotor.rotation.x = Math.PI / 2;
      rotor.position.set(x, .07, z);
      g.add(arm, rotor);
      g.userData.rotors = g.userData.rotors || [];
      g.userData.rotors.push(rotor);
    });
    return g;
  }

  function scooter() {
    const g = new THREE.Group();
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(.5, .12, 10, 26), metal(0x0e1322));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.3, .035, 8, 22), glow(VIOLET));
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.5, .08, .34), metal());
    deck.position.set(.75, -.34, 0);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 1.25, 8), metal());
    stem.position.set(0, .5, 0);
    stem.rotation.z = .2;
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .78, 8), metal());
    bar.position.set(.13, 1.1, 0);
    bar.rotation.x = Math.PI / 2;
    g.add(wheel, rim, deck, stem, bar);
    g.userData.spin = wheel;
    return g;
  }

  function earbuds() {
    const g = new THREE.Group();
    [-.3, .3].forEach((x, i) => {
      const bud = new THREE.Mesh(new THREE.SphereGeometry(.24, 14, 12), metal(0x1b2238));
      bud.position.set(x, .12, 0);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(.075, .06, .5, 8), metal(0x1b2238));
      stem.position.set(x, -.2, 0);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), glow(i ? VIOLET : TEAL));
      tip.position.set(x, -.44, 0);
      g.add(bud, stem, tip);
    });
    return g;
  }

  function vr() {
    const g = new THREE.Group();
    const shellGeo = new THREE.BoxGeometry(1.35, .66, .58);
    const body = new THREE.Mesh(shellGeo, metal());
    body.add(edges(shellGeo, VIOLET));
    const visor = new THREE.Mesh(new THREE.PlaneGeometry(1.12, .44), glow(VIOLET));
    visor.material.emissiveIntensity = .5;
    visor.position.z = .3;
    const strap = new THREE.Mesh(new THREE.TorusGeometry(.66, .06, 8, 26, Math.PI), metal(0x0e1322));
    strap.rotation.y = Math.PI / 2;
    strap.rotation.z = Math.PI / 2;
    g.add(body, visor, strap);
    return g;
  }

  /* ---------- Scène ---------- */
  function build(host) {
    canvas = document.createElement("canvas");
    canvas.className = "intro-canvas";
    host.prepend(canvas);

    const vp = viewport();
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !mobile });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.setSize(vp.w, vp.h);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x04060c, 9, 26);

    camera = new THREE.PerspectiveCamera(46, vp.w / vp.h, .1, 100);
    camera.position.z = 9.4;

    scene.add(new THREE.AmbientLight(0x4a5578, .85));
    const l1 = new THREE.PointLight(TEAL, 1.35, 26); l1.position.set(-5, 3.4, 6);
    const l2 = new THREE.PointLight(VIOLET, 1.35, 26); l2.position.set(5.4, -2.6, 5);
    const key = new THREE.DirectionalLight(0xffffff, .42); key.position.set(0, 4, 7);
    // contre-jour : détache la silhouette des objets du fond
    const rim = new THREE.DirectionalLight(0xbcd2ff, .55); rim.position.set(-2, -3, -6);
    scene.add(l1, l2, key, rim);

    orbit = new THREE.Group();
    scene.add(orbit);

    // Anneau d'objets autour du logo : rayon large pour dégager le centre.
    const makers = [laptop, watch, drone, scooter, earbuds, vr];
    const R = mobile ? 3.15 : 4.15;
    makers.forEach((make, i) => {
      const o = make();
      const a = (i / makers.length) * Math.PI * 2 - Math.PI / 2;
      o.userData.home = new THREE.Vector3(Math.cos(a) * R, Math.sin(a) * R * .62, -1.2 + (i % 3) * .9);
      o.userData.drift = .5 + Math.random() * .5;
      o.userData.tilt = (Math.random() - .5) * .7;
      o.scale.setScalar(mobile ? .72 : .92);
      orbit.add(o);
      pieces.push(o);
    });
  }

  /* ---------- Chorégraphie d'entrée ---------- */
  function enter() {
    const tl = gsap.timeline();
    pieces.forEach((o, i) => {
      const h = o.userData.home;
      // départ : loin derrière, hors axe — les objets "arrivent du monde entier"
      o.position.set(h.x * 3.4, h.y * 3.4, -26);
      o.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 2);
      const s = o.scale.x;
      o.scale.setScalar(s * .2);

      tl.to(o.position, { x: h.x, y: h.y, z: h.z, duration: 1.45, ease: "power3.out" }, i * .075)
        .to(o.scale, { x: s, y: s, z: s, duration: 1.45, ease: "power3.out" }, i * .075)
        .to(o.rotation, { x: o.userData.tilt, y: 0, z: 0, duration: 1.6, ease: "power2.out" }, i * .075);
    });
    return tl;
  }

  /* ---------- Boucle ---------- */
  function frame(now) {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const t = (now - started) / 1000;

    orbit.rotation.z = t * .085;
    pieces.forEach((o, i) => {
      o.position.z = o.userData.home.z + Math.sin(t * o.userData.drift + i) * .42;
      o.rotation.y += .0055 * (i % 2 ? 1 : -1);
      if (o.userData.rotors) o.userData.rotors.forEach((r) => { r.rotation.z += .42; });
      if (o.userData.spin) o.userData.spin.rotation.z -= .028;
    });

    // parallaxe lissée : la scène suit la souris (ou le gyroscope) avec inertie
    px += (tx - px) * .055;
    py += (ty - py) * .055;
    camera.position.x = px * 1.5;
    camera.position.y = py * 1.1;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  /* ---------- Interaction ---------- */
  function onMove(e) {
    tx = (e.clientX / window.innerWidth - .5) * 2;
    ty = -(e.clientY / window.innerHeight - .5) * 2;
  }
  function onTilt(e) {
    if (e.gamma == null) return;
    tx = Math.max(-1, Math.min(1, e.gamma / 35));
    ty = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
  }
  function onResize() {
    if (!alive) return;
    const vp = viewport();
    camera.aspect = vp.w / vp.h;
    camera.updateProjectionMatrix();
    renderer.setSize(vp.w, vp.h);
  }

  /* ---------- API ---------- */
  function init() {
    const host = document.getElementById("intro");
    if (!host || !usable()) return false;

    try { build(host); } catch { return false; }

    host.classList.add("is-3d"); // masque les anneaux/pastilles CSS devenus inutiles
    alive = true;
    started = performance.now();
    enter();
    raf = requestAnimationFrame(frame);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onTilt, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return true;
  }

  // Sortie : les objets accélèrent vers la caméra pendant que l'intro s'efface,
  // ce qui enchaîne sur le site au lieu de simplement disparaître.
  function exit() {
    if (!alive) return;
    pieces.forEach((o, i) => {
      gsap.to(o.position, { z: 11, duration: .72, ease: "power2.in", delay: i * .02 });
      gsap.to(o.scale, { x: o.scale.x * 2.4, y: o.scale.y * 2.4, z: o.scale.z * 2.4, duration: .72, ease: "power2.in", delay: i * .02 });
    });
    setTimeout(destroy, 820);
  }

  function destroy() {
    if (!alive) return;
    alive = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("deviceorientation", onTilt);
    window.removeEventListener("resize", onResize);
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
    renderer.dispose();
    canvas.remove();
    pieces = [];
  }

  return { init, exit };
})();
