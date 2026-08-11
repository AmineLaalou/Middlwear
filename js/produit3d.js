/* MIDDLWEAR — objet 3D manipulable dans la fiche produit

   Une seule scène vit à la fois (celle de la fiche ouverte) : les navigateurs
   limitent le nombre de contextes WebGL simultanés, en poser un par carte
   ferait tomber la grille entière.

   Les six formes de l'intro sont réutilisées telles quelles ; les six autres
   familles du catalogue sont construites ici, dans le même langage visuel :
   corps métallique sombre, arêtes lumineuses aux couleurs de la marque. */

const Produit3D = (() => {
  "use strict";

  const TEAL = 0x22f0c4;
  const VIOLET = 0x8b7cff;

  let renderer, scene, camera, objet, canvas, host;
  let raf = 0, vivant = false;
  let rotX = 0, rotY = 0, vX = 0, vY = .006, tient = false, dernier = null;

  function utilisable() {
    if (typeof THREE === "undefined" || typeof MWIntro === "undefined") return false;
    try {
      const c = document.createElement("canvas");
      return Boolean(c.getContext("webgl") || c.getContext("experimental-webgl"));
    } catch { return false; }
  }

  /* ---------- Formes propres à la boutique ---------- */
  const M = () => MWIntro.metal();
  const G = (c) => MWIntro.glow(c);
  const A = (geo, c) => MWIntro.edges(geo, c);

  function tour() {                       // ordinateur de bureau
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(1.1, 2, 1.05);
    const boitier = new THREE.Mesh(geo, M());
    boitier.add(A(geo, TEAL));
    const led = new THREE.Mesh(new THREE.PlaneGeometry(.6, .06), G(TEAL));
    led.position.set(0, .68, .53);
    const grille = new THREE.Mesh(new THREE.PlaneGeometry(.7, .5), G(VIOLET));
    grille.material.emissiveIntensity = .3;
    grille.position.set(0, -.2, .53);
    g.add(boitier, led, grille);
    return g;
  }

  function tablette() {
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(1.35, 1.9, .07);
    const corps = new THREE.Mesh(geo, M());
    corps.add(A(geo, TEAL));
    const ecran = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.72), G(TEAL));
    ecran.material.emissiveIntensity = .45;
    ecran.position.z = .05;
    g.add(corps, ecran);
    return g;
  }

  function bracelet() {
    const g = new THREE.Group();
    const anneau = new THREE.Mesh(new THREE.TorusGeometry(.72, .11, 12, 34), M());
    const module = new THREE.Mesh(new THREE.BoxGeometry(.4, .62, .16), M());
    module.position.y = .72;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(.28, .48), G(VIOLET));
    face.position.set(0, .72, .09);
    g.add(anneau, module, face);
    return g;
  }

  function bague() {
    const g = new THREE.Group();
    const anneau = new THREE.Mesh(new THREE.TorusGeometry(.62, .14, 14, 40), M());
    const capteur = new THREE.Mesh(new THREE.TorusGeometry(.62, .05, 10, 40), G(TEAL));
    capteur.position.z = .06;
    g.add(anneau, capteur);
    return g;
  }

  function lunettes() {
    const g = new THREE.Group();
    [-.52, .52].forEach((x) => {
      const geo = new THREE.BoxGeometry(.78, .5, .06);
      const verre = new THREE.Mesh(geo, G(TEAL));
      verre.material.emissiveIntensity = .35;
      verre.material.transparent = true;
      verre.material.opacity = .82;
      verre.position.x = x;
      verre.add(A(geo, TEAL));
      g.add(verre);
    });
    const pont = new THREE.Mesh(new THREE.BoxGeometry(.3, .09, .06), M());
    const brancheG = new THREE.Mesh(new THREE.BoxGeometry(.08, .09, .8), M());
    brancheG.position.set(-.9, 0, -.4);
    const brancheD = brancheG.clone();
    brancheD.position.x = .9;
    g.add(pont, brancheG, brancheD);
    return g;
  }

  function enceinte() {
    const g = new THREE.Group();
    const corps = new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, 1.3, 26), M());
    const hautG = new THREE.Mesh(new THREE.TorusGeometry(.34, .06, 10, 26), G(TEAL));
    hautG.position.set(0, .1, .6);
    const bas = new THREE.Mesh(new THREE.TorusGeometry(.2, .05, 10, 24), G(VIOLET));
    bas.position.set(0, -.4, .6);
    g.add(corps, hautG, bas);
    return g;
  }

  // `icon` du catalogue -> forme 3D. Aucune famille n'est laissée de côté.
  const FORMES = {
    laptop: () => MWIntro.formes.laptop(),
    watch: () => MWIntro.formes.watch(),
    drone: () => MWIntro.formes.drone(),
    scooter: () => MWIntro.formes.scooter(),
    earbuds: () => MWIntro.formes.earbuds(),
    vr: () => MWIntro.formes.vr(),
    desktop: tour,
    tablet: tablette,
    band: bracelet,
    ring: bague,
    glasses: lunettes,
    speaker: enceinte
  };

  const connait = (icon) => Boolean(FORMES[icon]);

  /* ---------- Montage ---------- */
  function monter(hote, icon) {
    if (!utilisable() || !FORMES[icon]) return false;
    demonter();

    host = hote;
    canvas = document.createElement("canvas");
    canvas.className = "p3d-canvas";
    host.appendChild(canvas);

    const l = host.clientWidth || 300, h = host.clientHeight || 260;
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(l, h);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, l / h, .1, 60);
    camera.position.z = 6.2;

    scene.add(new THREE.AmbientLight(0x4a5578, .9));
    const l1 = new THREE.PointLight(TEAL, 1.3, 22); l1.position.set(-4, 3, 6);
    const l2 = new THREE.PointLight(VIOLET, 1.3, 22); l2.position.set(4, -2, 5);
    const rim = new THREE.DirectionalLight(0xbcd2ff, .5); rim.position.set(-2, -2, -5);
    scene.add(l1, l2, rim);

    objet = FORMES[icon]();
    objet.scale.setScalar(1.35);
    scene.add(objet);

    rotX = -.2; rotY = .6; vX = 0; vY = .006;
    vivant = true;
    boucle();
    brancherGestes();
    window.addEventListener("resize", redimensionner, { passive: true });
    return true;
  }

  function boucle() {
    if (!vivant) return;
    raf = requestAnimationFrame(boucle);
    if (!tient) {
      // inertie puis reprise douce de la rotation d'inspection
      vY += (.006 - vY) * .02;
      vX *= .93;
    }
    rotY += vY; rotX += vX;
    rotX = Math.max(-.9, Math.min(.9, rotX));   // on ne renverse jamais l'objet
    objet.rotation.set(rotX, rotY, 0);
    renderer.render(scene, camera);
  }

  /* ---------- Manipulation ---------- */
  function brancherGestes() {
    const pos = (e) => (e.touches && e.touches[0]) ? e.touches[0] : e;

    const debut = (e) => {
      tient = true;
      dernier = { x: pos(e).clientX, y: pos(e).clientY };
      host.classList.add("p3d-tient");
    };
    const bouge = (e) => {
      if (!tient || !dernier) return;
      const p = pos(e);
      vY = (p.clientX - dernier.x) * .008;
      vX = (p.clientY - dernier.y) * .006;
      dernier = { x: p.clientX, y: p.clientY };
      if (e.cancelable) e.preventDefault();   // au doigt, empêche la page de défiler
    };
    const fin = () => { tient = false; dernier = null; host.classList.remove("p3d-tient"); };

    host.addEventListener("mousedown", debut);
    window.addEventListener("mousemove", bouge);
    window.addEventListener("mouseup", fin);
    host.addEventListener("touchstart", debut, { passive: true });
    host.addEventListener("touchmove", bouge, { passive: false });
    host.addEventListener("touchend", fin);

    host._p3d = { bouge, fin };
  }

  function redimensionner() {
    if (!vivant || !host) return;
    const l = host.clientWidth || 300, h = host.clientHeight || 260;
    camera.aspect = l / h;
    camera.updateProjectionMatrix();
    renderer.setSize(l, h);
  }

  function demonter() {
    if (!vivant) return;
    vivant = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", redimensionner);
    if (host && host._p3d) {
      window.removeEventListener("mousemove", host._p3d.bouge);
      window.removeEventListener("mouseup", host._p3d.fin);
      delete host._p3d;
    }
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
    renderer.dispose();
    if (canvas) canvas.remove();
    host = canvas = objet = null;
  }

  return { monter, demonter, connait };
})();
