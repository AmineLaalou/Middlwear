(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const body = document.body;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============ INTRO ============ */
  // Au rechargement, le navigateur restaure la position de défilement. Comme
  // l'intro masque la page pendant ~4 s, on la découvrait déjà défilée en plein
  // milieu. On reprend la main sur cette restauration.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const intro = $("intro");
  const app = $("app");
  let introDone = false;

  function endIntro() {
    if (introDone) return;
    introDone = true;
    if (typeof MWIntro !== "undefined") MWIntro.exit();
    intro.classList.add("hidden");
    body.classList.remove("intro-active");
    app.classList.add("visible");

    // On découvre toujours le site par le haut, jamais au milieu.
    // Lenis tient sa propre position : la remettre à zéro ne suffit pas côté window.
    window.scrollTo(0, 0);
    if (typeof MWMotion !== "undefined" && MWMotion.lenis) {
      MWMotion.lenis.scrollTo(0, { immediate: true });
    }
    setTimeout(() => {
      intro.remove();
      MWVisuals.initReveal();
    }, 720);
  }
  body.classList.add("intro-active");
  // La scène 3D allonge légèrement l'intro pour laisser les objets se placer ;
  // si elle ne démarre pas (WebGL absent, CDN injoignable), on garde le timing court.
  // `const MWIntro = …` déclare une globale sans la poser sur window : c'est
  // typeof qu'il faut tester ici, pas window.MWIntro (toujours undefined).
  const intro3D = typeof MWIntro !== "undefined" ? MWIntro.init() : false;
  const introTimer = setTimeout(endIntro, reduced ? 0 : (intro3D ? 3900 : 3100));
  $("skip").addEventListener("click", () => { clearTimeout(introTimer); endIntro(); });
  if (reduced) endIntro();

  /* ============ CONSTANTES ============ */
  const BUDGET_MAX = 18000;
  const FREE_SHIP = 500;
  const SHIP_COST = 39;

  const CATS = {
    all: "Tous",
    ordinateurs: "Ordinateurs",
    connecte: "Connecté",
    gadgets: "Gadgets",
    mobilite: "Mobilité"
  };

  const BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  // Une photo par TYPE d'objet, pas par référence : le catalogue est illustré
  // par des visuels représentatifs, pas par des photos des produits eux-mêmes.
  const CATEGORY_PHOTOS = {
    laptop: "assets/photos/laptop.png",
    scooter: "assets/photos/scooter.png",
    watch: "assets/photos/watch.png",
    glasses: "assets/photos/glasses.png",
    tablet: "assets/photos/tablet.png",
    band: "assets/photos/band.png",
    earbuds: "assets/photos/earbuds.png",
    ring: "assets/photos/ring.png",
    speaker: "assets/photos/speaker.jpg",
    drone: "assets/photos/drone.jpg",
    vr: "assets/photos/vr.jpg"
  };
  const fmt = (n) => n.toLocaleString("fr-FR") + " Dh";

  /* ============ ÉTAT ============ */
  const state = {
    q: "",
    cat: "all",
    icon: null,       // affine "connecte" (montre vs lunette) quand on vient d'un pick hero
    budget: BUDGET_MAX,
    axis: 50,        // 0 = économique, 100 = performance
    sort: "smart"
  };
  /* Panier persistant — on ne garde que les ids encore présents au catalogue,
     pour qu'un produit retiré de data.js ne réapparaisse pas comme ligne fantôme. */
  const CART_KEY = "mw_cart";
  const cart = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
      return Object.fromEntries(
        Object.entries(saved).filter(([id, q]) => BY_ID[id] && Number.isFinite(q) && q > 0)
      );
    } catch {
      return {};
    }
  })();

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {}
  }

  /* ============ AXE ÉCONOMIQUE ⇄ PERFORMANCE ============ */
  /* Le curseur ne coupe pas brutalement le catalogue : il repondère.
     À gauche on privilégie le rapport qualité/prix (perf élevée pour un prix bas),
     à droite la performance brute. Le score sert au tri, et un seuil doux
     écarte les produits vraiment hors sujet quand on pousse aux extrêmes. */

  const MAX_PRICE = Math.max(...PRODUCTS.map((p) => p.price));

  function axisScore(p) {
    const a = state.axis / 100;                 // 0 → éco, 1 → perf
    const perfN = p.perf / 100;                 // 0..1
    const cheapN = 1 - p.price / MAX_PRICE;     // 1 = très abordable
    const value = perfN * 0.55 + cheapN * 0.45; // rapport qualité/prix
    // pondération continue entre "bon plan" et "performance pure"
    return (1 - a) * (cheapN * 0.6 + value * 0.4) + a * (perfN * 0.85 + value * 0.15);
  }

  function axisLabel() {
    const v = state.axis;
    if (v <= 12) return ["Priorité au prix", "les options les plus abordables d'abord"];
    if (v <= 32) return ["Bon plan", "meilleur rapport qualité/prix"];
    if (v <= 46) return ["Équilibré, penché budget", "de bonnes specs sans exploser le budget"];
    if (v <= 54) return ["Équilibré", "compromis prix / performance"];
    if (v <= 68) return ["Équilibré, penché perfs", "on monte en gamme sans viser le sommet"];
    if (v <= 88) return ["Performance", "les configurations les plus solides"];
    return ["Performance maximale", "le haut du panier, sans compromis"];
  }

  function updateAxisUI() {
    const [title, sub] = axisLabel();
    $("axis-caption").innerHTML = `<b>${title}</b> — ${sub}`;
    const a = state.axis;
    $("end-eco").classList.toggle("dim", a > 62);
    $("end-perf").classList.toggle("dim", a < 38);

    // la couleur du curseur suit la position
    const mix = a / 100;
    const thumb = mix < 0.5 ? "#22f0c4" : "#8b7cff";
    document.documentElement.style.setProperty("--axis-thumb", thumb);
    const slider = $("axis");
    slider.style.setProperty("--c", thumb);
  }

  /* ============ FILTRAGE ============ */
  function compute() {
    let list = PRODUCTS.filter((p) => {
      const okQ = !state.q || (p.name + " " + p.brand + " " + p.specs.join(" ")).toLowerCase().includes(state.q);
      const okC = state.cat === "all" || p.category === state.cat;
      const okI = !state.icon || p.icon === state.icon;
      const okB = p.price <= state.budget;
      return okQ && okC && okI && okB;
    });

    switch (state.sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "newest": list.sort((a, b) => new Date(b.added) - new Date(a.added)); break;
      default: list.sort((a, b) => axisScore(b) - axisScore(a)); break;
    }
    return list;
  }

  /* ============ RENDU GRILLE ============ */
  // L'état et la garantie sont un argument de vente, pas une mention légale :
  // 6 mois sur le reconditionné nous place au-dessus des 3 mois pratiqués par
  // plusieurs concurrents marocains. On l'affiche donc dès la carte.
  function conditionHTML(p) {
    if (!p.condition) return "";
    const recond = p.condition === "reconditionne";
    return `<div class="cond ${recond ? "recond" : "neuf"}">
      <strong>${recond ? "Reconditionné" : "Neuf"}</strong>
      <span>garantie ${p.warranty} mois</span>
    </div>`;
  }

  function cardHTML(p, i) {
    const badge = p.badge
      ? `<span class="badge ${p.badge.toLowerCase().replace(/\s+/g, "-").replace("é", "e")}">${p.badge}</span>` : "";
    const old = p.oldPrice ? `<span class="pold">${fmt(p.oldPrice)}</span>` : "";
    const photo = CATEGORY_PHOTOS[p.icon];
    const icHTML = photo
      ? `<img src="${photo}" alt="${p.name}" loading="lazy" />`
      : (PRODUCT_ICONS[p.icon] || "");
    return `
      <article class="card" data-tilt="8" data-id="${p.id}" tabindex="0" role="button"
               aria-label="Voir la fiche de ${p.name}" style="animation-delay:${Math.min(i * 38, 340)}ms">
        ${badge}
        <div class="card-ic${photo ? " has-photo" : ""}">${icHTML}</div>
        <div class="card-cat">${CATS[p.category] || p.category}</div>
        <div class="card-brand">${p.brand}</div>
        <h3 class="card-name">${p.name}</h3>
        <div class="perf-bar">
          <div class="pt"><div class="pf" data-w="${p.perf}"></div></div>
          <span>RATIO QUALITÉ/PRIX ${p.perf}</span>
        </div>
        <div class="specs">${p.specs.map((s) => `<span>${s}</span>`).join("")}</div>
        ${conditionHTML(p)}
        <div class="card-foot">
          <div class="pblock"><span class="pnow">${fmt(p.price)}</span>${old}</div>
          <button class="add" type="button" data-add="${p.id}">${ICONS.cart}Ajouter</button>
        </div>
      </article>`;
  }

  const grid = $("grid");
  const cardEls = new Map(); // id produit -> carte réutilisée d'un rendu à l'autre

  function render() {
    const res = compute();
    $("count").innerHTML = `<strong>${res.length}</strong> article${res.length !== 1 ? "s" : ""}`;

    if (!res.length) {
      grid.innerHTML = `
        <div class="empty">
          ${ICONS.empty}
          <h3>Aucun article ne correspond</h3>
          <p>Essayez d'élargir le budget, de changer de catégorie ou de recentrer le curseur.</p>
          <button type="button" id="ereset">Réinitialiser</button>
        </div>`;
      $("ereset").addEventListener("click", reset);
      return;
    }

    // On réordonne des éléments réutilisés au lieu de reconstruire le HTML : un
    // glissement de curseur déclenche des dizaines de rendus, et tout rebâtir
    // redécoderait les images et relancerait les 37 animations à chaque pixel,
    // au point de rendre le curseur impossible à faire glisser.
    const fresh = [];
    const frag = document.createDocumentFragment();
    res.forEach((p, i) => {
      let el = cardEls.get(p.id);
      if (!el) {
        const holder = document.createElement("div");
        holder.innerHTML = cardHTML(p, i);
        el = holder.firstElementChild;
        cardEls.set(p.id, el);
        fresh.push(el);
      }
      frag.appendChild(el);
    });
    grid.replaceChildren(frag);

    if (!fresh.length) return;
    requestAnimationFrame(() => {
      fresh.forEach((c) => {
        c.classList.add("in");
        const bar = c.querySelector(".pf");
        if (bar) bar.style.width = bar.dataset.w + "%";
      });
      MWVisuals.bindTilt(grid);
    });
  }

  /* ============ CONTRÔLES ============ */
  let deb;
  $("q").addEventListener("input", (e) => {
    clearTimeout(deb);
    const v = e.target.value;
    deb = setTimeout(() => { state.q = v.trim().toLowerCase(); state.icon = null; render(); }, 150);
  });

  $("chips").addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    $("chips").querySelectorAll(".chip").forEach((x) => x.classList.remove("on"));
    c.classList.add("on");
    state.cat = c.dataset.cat;
    state.icon = null;
    render();
  });

  /* ============ ORBITE HERO — les photos gravitent autour de la boule ============ */
  function initHeroOrbit() {
    const wrap = $("hero-orbit");
    if (!wrap) return;
    const items = Array.from(wrap.querySelectorAll(".hero-pick"));
    if (!items.length) return;

    const N = items.length;
    const baseAngles = items.map((_, i) => (i / N) * Math.PI * 2 - Math.PI / 2);
    const PERIOD_MS = 42000; // un tour complet toutes les 42s — lent et élégant
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let hovered = -1;
    const curScale = items.map(() => 1);

    items.forEach((el, i) => {
      el.dataset.x = 0; el.dataset.y = 0;

      el.addEventListener("click", () => {
        state.cat = el.dataset.cat;
        state.icon = el.dataset.ic || null;
        state.q = ""; $("q").value = "";
        $("chips").querySelectorAll(".chip").forEach((x) => x.classList.toggle("on", x.dataset.cat === state.cat));
        render();
        $("shop").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      });

      if (coarse) return; // pas de survol sur tactile — le tap suffit pour filtrer
      el.addEventListener("mouseenter", () => { hovered = i; el.classList.add("hovered"); });
      el.addEventListener("mouseleave", () => {
        if (hovered === i) hovered = -1;
        el.classList.remove("hovered");
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", (px * 20).toFixed(2) + "deg");
        el.style.setProperty("--rx", (-py * 20).toFixed(2) + "deg");
      });
    });

    function place(now) {
      const factor = window.innerWidth <= 640 ? 0.72 : 0.9;
      const r = Math.min(wrap.clientWidth, wrap.clientHeight) / 2 * factor;
      const spin = reduced ? 0 : (now / PERIOD_MS) * Math.PI * 2;
      items.forEach((el, i) => {
        if (i !== hovered) {
          const a = baseAngles[i] + spin;
          el.dataset.x = Math.cos(a) * r;
          el.dataset.y = Math.sin(a) * r;
        }
        const target = i === hovered ? 1.16 : 1;
        curScale[i] += (target - curScale[i]) * 0.14;
        el.style.transform =
          `translate(${el.dataset.x}px, ${el.dataset.y}px) translate(-50%,-50%) ` +
          `perspective(700px) rotateX(var(--rx)) rotateY(var(--ry)) scale(${curScale[i].toFixed(3)})`;
      });
    }

    if (reduced) { place(0); return; }
    (function loop(t) { requestAnimationFrame(loop); place(t); })(0);
  }
  initHeroOrbit();

  $("sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });

  const axisEl = $("axis");
  axisEl.addEventListener("input", (e) => {
    state.axis = Number(e.target.value);
    if (state.sort !== "smart") { state.sort = "smart"; $("sort").value = "smart"; }
    updateAxisUI();
    render();
  });

  const budgetEl = $("budget");
  function updateBudgetUI() {
    $("bfill").style.width = (state.budget / BUDGET_MAX) * 100 + "%";
    $("bval").textContent = state.budget >= BUDGET_MAX ? `Jusqu'à ${fmt(BUDGET_MAX)}+` : `Jusqu'à ${fmt(state.budget)}`;
  }
  budgetEl.addEventListener("input", (e) => {
    state.budget = Number(e.target.value);
    updateBudgetUI();
    render();
  });

  function reset() {
    Object.assign(state, { q: "", cat: "all", icon: null, budget: BUDGET_MAX, axis: 50, sort: "smart" });
    $("q").value = "";
    $("sort").value = "smart";
    budgetEl.value = BUDGET_MAX;
    axisEl.value = 50;
    $("chips").querySelectorAll(".chip").forEach((x) => x.classList.remove("on"));
    $("chips").querySelector('[data-cat="all"]').classList.add("on");
    updateBudgetUI(); updateAxisUI(); render();
  }
  $("reset").addEventListener("click", reset);

  /* ============ FICHE PRODUIT ============ */
  /* `hw` (SPEC-UX §D) porte les caractéristiques structurées, `specs` reste le
     texte affiché. Convention de nullité respectée telle quelle :
       clé absente = sans objet  -> ligne masquée
       valeur null = non détenue -> ligne "non communiqué"
     Rien n'est deviné : un produit sans `hw` affiche simplement ses `specs`. */
  const pmodal = $("pmodal"), povl = $("povl");

  const LABELS = {
    cpu: "Processeur", ram: "Mémoire", storage: "Stockage", screen: "Écran", gpu: "Carte graphique",
    rangeKm: "Autonomie", speedKmh: "Vitesse max", motorW: "Moteur", weightKg: "Poids",
    batteryH: "Batterie", flightMin: "Temps de vol", display: "Affichage"
  };

  function hwRows(hw) {
    if (!hw) return [];
    const rows = [];
    const push = (key, val) => { if (key in hw) rows.push([LABELS[key] || key, val]); };

    if (hw.kind === "pc") {
      push("cpu", hw.cpu && hw.cpu.label);
      push("ram", hw.ram && hw.ram + " Go");
      push("storage", hw.storage && (hw.storage >= 1024 ? hw.storage / 1024 + " To" : hw.storage + " Go")
        + (hw.storageType ? " " + hw.storageType : ""));
      push("screen", hw.screen && [
        hw.screen.size + "\"", hw.screen.res, hw.screen.hz && hw.screen.hz + " Hz"
      ].filter(Boolean).join(" · "));
      push("gpu", hw.gpu && (hw.gpu === "dedie" ? "Dédiée" : "Intégrée"));
    } else {
      ["rangeKm", "speedKmh", "motorW", "weightKg", "batteryH", "flightMin", "display"].forEach((k) => {
        const unit = { rangeKm: " km", speedKmh: " km/h", motorW: " W", weightKg: " kg", batteryH: " h", flightMin: " min" }[k] || "";
        push(k, hw[k] && hw[k] + unit);
      });
    }
    return rows;
  }

  function sheetHTML(p) {
    const photo = CATEGORY_PHOTOS[p.icon];
    const visual = photo
      ? `<img src="${photo}" alt="${p.name}" />`
      : (PRODUCT_ICONS[p.icon] || "");
    const rows = hwRows(p.hw);
    const table = rows.length ? `
      <dl class="pm-tbl">
        ${rows.map(([k, v]) => v
          ? `<dt>${k}</dt><dd>${v}</dd>`
          : `<dt>${k}</dt><dd class="unknown">non communiqué</dd>`).join("")}
      </dl>` : "";

    return `
      <div class="pm-visual">${visual}</div>
      <div class="pm-info">
        <span class="pm-eyebrow">${CATS[p.category] || p.category} · ${p.brand}</span>
        <h3 id="pm-name">${p.name}</h3>
        <div class="pm-price">
          <span class="now">${fmt(p.price)}</span>
          ${p.oldPrice ? `<span class="old">${fmt(p.oldPrice)}</span>` : ""}
        </div>
        <div class="perf-bar">
          <div class="pt"><div class="pf" style="width:${p.perf}%"></div></div>
          <span>RATIO QUALITÉ/PRIX ${p.perf}</span>
        </div>
        <div class="pm-chips">${p.specs.map((s) => `<span>${s}</span>`).join("")}</div>
        ${conditionHTML(p)}
        ${table}
        <button class="add pm-add" type="button" data-add="${p.id}">${ICONS.cart}Ajouter au panier</button>
      </div>`;
  }

  function openSheet(id) {
    const p = BY_ID[id];
    if (!p) return;
    $("pm-body").innerHTML = sheetHTML(p);
    pmodal.classList.add("on");
    povl.classList.add("on");
    body.classList.add("modal-open");
    $("pm-close").focus();
  }
  function closeSheet() {
    pmodal.classList.remove("on");
    povl.classList.remove("on");
    body.classList.remove("modal-open");
  }
  $("pm-close").addEventListener("click", closeSheet);
  povl.addEventListener("click", closeSheet);

  // Le bouton d'ajout de la fiche vit hors de la grille : il lui faut son propre relais.
  $("pm-body").addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (!b) return;
    addToCart(b.dataset.add);
    closeSheet();
  });

  grid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".card");
    if (!card) return;
    e.preventDefault();
    openSheet(card.dataset.id);
  });

  /* ============ PANIER ============ */
  const lines = () => Object.entries(cart).filter(([, q]) => q > 0)
    .map(([id, q]) => ({ p: BY_ID[id], q })).filter((l) => l.p);
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = () => lines().reduce((s, l) => s + l.p.price * l.q, 0);

  const drawer = $("drawer"), ovl = $("ovl");
  const openCart = () => { drawer.classList.add("on"); ovl.classList.add("on"); body.classList.add("modal-open"); };
  const closeCart = () => { drawer.classList.remove("on"); ovl.classList.remove("on"); body.classList.remove("modal-open"); };
  $("cart-btn").addEventListener("click", openCart);
  $("dclose").addEventListener("click", closeCart);
  ovl.addEventListener("click", closeCart);

  function toast(msg) {
    const t = $("toast");
    t.innerHTML = ICONS.check + `<span>${msg}</span>`;
    t.classList.add("on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("on"), 2100);
  }

  grid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (!b) {
      // clic ailleurs sur la carte : on ouvre la fiche détaillée
      const card = e.target.closest(".card");
      if (card) openSheet(card.dataset.id);
      return;
    }
    const id = b.dataset.add;
    addToCart(id);
    b.classList.add("done");
    b.innerHTML = ICONS.check + "Ajouté";
    setTimeout(() => { b.classList.remove("done"); b.innerHTML = ICONS.cart + "Ajouter"; }, 1200);
  });

  // Partagé entre la grille et la fiche produit : l'ajout doit se comporter
  // exactement pareil des deux côtés (compteur, animation, toast).
  function addToCart(id) {
    if (!BY_ID[id]) return;
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    const cc = $("cc");
    cc.classList.remove("bump"); void cc.offsetWidth; cc.classList.add("bump");
    toast(`${BY_ID[id].name} ajouté au panier`);
  }

  function renderCart() {
    saveCart(); // appelé après chaque mutation du panier — point unique de persistance
    const ls = lines(), n = count();
    $("cc").textContent = n;
    $("cc").style.display = n ? "grid" : "none";

    if (!ls.length) {
      $("db").innerHTML = `<div class="cempty">${ICONS.cart}<p>Votre panier est vide.</p></div>`;
      $("df").style.display = "none";
      return;
    }
    $("df").style.display = "block";
    $("db").innerHTML = ls.map((l) => `
      <div class="ci">
        <div class="th">${PRODUCT_ICONS[l.p.icon] || ""}</div>
        <div class="inf">
          <h4>${l.p.name}</h4>
          <span class="cat">${CATS[l.p.category]}</span>
          <div class="r2">
            <div class="qty">
              <button type="button" data-q="d" data-id="${l.p.id}">${ICONS.minus}</button>
              <span>${l.q}</span>
              <button type="button" data-q="i" data-id="${l.p.id}">${ICONS.plus}</button>
            </div>
            <div style="display:flex;align-items:center">
              <span class="ip">${fmt(l.p.price * l.q)}</span>
              <button type="button" class="rm" data-rm="${l.p.id}">${ICONS.trash}</button>
            </div>
          </div>
        </div>
      </div>`).join("");

    const sub = subtotal();
    const ship = sub >= FREE_SHIP ? 0 : SHIP_COST;
    $("dtotal").textContent = fmt(sub + ship);
    $("snote").innerHTML = sub >= FREE_SHIP
      ? ICONS.truck + "<span>Livraison gratuite débloquée</span>"
      : ICONS.truck + `<span>Plus que ${fmt(FREE_SHIP - sub)} pour la livraison gratuite</span>`;
  }

  $("db").addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]"), r = e.target.closest("[data-rm]");
    if (q) {
      const id = q.dataset.id;
      cart[id] = Math.max(0, (cart[id] || 0) + (q.dataset.q === "i" ? 1 : -1));
      if (!cart[id]) delete cart[id];
      renderCart();
    } else if (r) { delete cart[r.dataset.rm]; renderCart(); }
  });

  /* ============ CHECKOUT ============ */
  let step = 1;
  let stripeEnabled = false;
  const modal = $("cmodal");

  fetch("/api/stripe/config", { credentials: "include" })
    .then((r) => r.json())
    .then((d) => { stripeEnabled = Boolean(d.enabled); })
    .catch(() => { stripeEnabled = false; }); // backend indisponible ou Stripe non configuré : flux maquette inchangé

  function openCheckout() {
    if (!count()) return;
    closeCart();
    step = 1; showStep(); renderSummary();
    modal.classList.add("on"); body.classList.add("modal-open");
  }
  const closeCheckout = () => { modal.classList.remove("on"); body.classList.remove("modal-open"); };
  $("go-checkout").addEventListener("click", openCheckout);
  $("cclose").addEventListener("click", closeCheckout);
  $("cmo").addEventListener("click", closeCheckout);

  function renderSummary() {
    const ls = lines();
    $("si").innerHTML = ls.map((l) => `<div><span>${l.p.name} × ${l.q}</span><span>${fmt(l.p.price * l.q)}</span></div>`).join("");
    const sub = subtotal(), ship = sub >= FREE_SHIP ? 0 : SHIP_COST;
    $("s-sub").textContent = fmt(sub);
    $("s-ship").textContent = ship ? fmt(ship) : "Gratuite";
    $("s-tot").textContent = fmt(sub + ship);
  }

  function showStep() {
    $("st1").style.display = step === 1 ? "block" : "none";
    $("st2").style.display = step === 2 ? "block" : "none";
    $("st3").style.display = step === 3 ? "block" : "none";
    document.querySelectorAll(".steps .s").forEach((el, i) => {
      el.classList.toggle("done", i + 1 < step);
      el.classList.toggle("act", i + 1 === step);
    });
    $("cnav").style.display = step === 3 ? "none" : "flex";

    if (step === 2) {
      $("st2-stripe").style.display = stripeEnabled ? "block" : "none";
      $("st2-demo").style.display = stripeEnabled ? "none" : "block";
      $("cnext").textContent = stripeEnabled ? "Payer avec Stripe" : "Continuer";
    } else if (step === 1) {
      $("cnext").textContent = "Continuer";
    }
  }

  function checkShipping() {
    let ok = true;
    ["f-name", "f-phone", "f-addr", "f-city"].forEach((id) => {
      const el = $(id), w = el.closest(".fld");
      const bad = !el.value.trim();
      w.classList.toggle("err", bad);
      if (bad) ok = false;
    });
    return ok;
  }

  function luhn(s) {
    const d = s.replace(/\D/g, "");
    if (d.length < 13) return false;
    let sum = 0, alt = false;
    for (let i = d.length - 1; i >= 0; i--) {
      let n = +d[i];
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return sum % 10 === 0;
  }

  function checkPayment() {
    let ok = true;
    const set = (el, valid) => { el.closest(".fld").classList.toggle("err", !valid); if (!valid) ok = false; };
    set($("p-name"), $("p-name").value.trim().length > 1);
    set($("p-num"), luhn($("p-num").value));
    set($("p-exp"), /^(0[1-9]|1[0-2])\/\d{2}$/.test($("p-exp").value.trim()));
    set($("p-cvc"), /^\d{3,4}$/.test($("p-cvc").value.trim()));
    return ok;
  }

  async function payWithStripe() {
    const ls = lines();
    const sub = subtotal(), ship = sub >= FREE_SHIP ? 0 : SHIP_COST;
    const errEl = $("stripe-err");
    errEl.style.display = "none";
    $("cnext").disabled = true;
    $("cnext").textContent = "Redirection…";
    try {
      const r = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: ls.map((l) => ({ id: l.p.id, name: l.p.name, price: l.p.price, qty: l.q })),
          shipping: {
            name: $("f-name").value.trim(),
            phone: $("f-phone").value.trim(),
            city: $("f-city").value.trim(),
            address: $("f-addr").value.trim()
          },
          subtotal: sub, shippingCost: ship, total: sub + ship
        })
      });
      const data = await r.json();
      if (!r.ok || !data.url) throw new Error(data.error || "Impossible de démarrer le paiement Stripe.");
      window.location.href = data.url; // redirection vers la page de paiement hébergée par Stripe
    } catch (e) {
      errEl.textContent = e.message;
      errEl.style.display = "block";
      $("cnext").disabled = false;
      $("cnext").textContent = "Payer avec Stripe";
    }
  }

  $("cnext").addEventListener("click", () => {
    if (step === 1) { if (!checkShipping()) return; step = 2; }
    else if (step === 2 && stripeEnabled) { payWithStripe(); return; }
    else if (step === 2) {
      if (!checkPayment()) return;
      step = 3;
      const ls = lines();
      const sub = subtotal(), ship = sub >= FREE_SHIP ? 0 : SHIP_COST;
      const orderRef = "MW-" + Math.floor(100000 + Math.random() * 899999);
      $("oid").textContent = "Commande n° " + orderRef;
      $("ctot").textContent = fmt(sub + ship);

      // Enregistre la commande côté serveur (mode complet uniquement — voir
      // server/routes/orders.js). N'empêche jamais la confirmation à l'écran
      // si le backend est indisponible (mode statique, hors ligne, etc.).
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orderRef,
          items: ls.map((l) => ({ id: l.p.id, name: l.p.name, price: l.p.price, qty: l.q })),
          shipping: {
            name: $("f-name").value.trim(),
            phone: $("f-phone").value.trim(),
            city: $("f-city").value.trim(),
            address: $("f-addr").value.trim()
          },
          subtotal: sub, shippingCost: ship, total: sub + ship
        })
      }).catch(() => {});

      Object.keys(cart).forEach((k) => delete cart[k]);
      renderCart();
    }
    showStep();
  });
  $("cback").addEventListener("click", () => { if (step > 1) { step--; showStep(); } });
  $("cdone").addEventListener("click", closeCheckout);

  // formatage carte en direct
  $("fill-demo").addEventListener("click", () => {
    const d = new Date();
    const exp = String(d.getMonth() + 1).padStart(2, "0") + "/" + String((d.getFullYear() + 2) % 100);
    const set = (id, val) => {
      const el = $(id);
      el.value = val;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.closest(".fld").classList.remove("err");
    };
    set("p-name", "CARTE DE TEST");
    set("p-num", "4242424242424242");
    set("p-exp", exp.replace("/", ""));
    set("p-cvc", "123");
    $("p-exp").value = exp;
    $("v-exp").textContent = exp;
  });

  $("p-num").addEventListener("input", (e) => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 16);
    e.target.value = d.replace(/(.{4})/g, "$1 ").trim();
    $("v-num").textContent = d.length ? e.target.value.padEnd(19, "•") : "•••• •••• •••• ••••";
  });
  $("p-name").addEventListener("input", (e) => {
    $("v-name").textContent = e.target.value.trim().toUpperCase() || "VOTRE NOM";
  });
  $("p-exp").addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    e.target.value = v;
    $("v-exp").textContent = v || "MM/AA";
  });

  // Échap ferme les panneaux
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modal.classList.contains("on")) closeCheckout();
    else if (pmodal.classList.contains("on")) closeSheet();
    else if (drawer.classList.contains("on")) closeCart();
  });

  /* ============ HEADER AU SCROLL ============ */
  const hdr = document.querySelector("header.hdr");
  window.addEventListener("scroll", () => {
    hdr.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  /* ============ SÉLECTEUR DE BUDGET (hero) ============ */
  /* Un acheteur de reconditionné part de son budget, pas d'un modèle. On lui
     rend donc la meilleure affaire atteignable — la note qualité/prix la plus
     haute dans son enveloppe — et surtout l'économie réalisée, qui est
     l'argument central du reconditionné. */
  (() => {
    const input = $("bg-input"), res = $("bg-res"), quick = $("bg-quick");
    if (!input || !res) return;

    function meilleurPour(budget) {
      const dans = PRODUCTS.filter((p) => p.price <= budget);
      if (!dans.length) return null;
      // à note égale, on privilégie ce qui utilise le mieux le budget
      return dans.sort((a, b) => (b.perf - a.perf) || (b.price - a.price))[0];
    }

    function rendre() {
      const budget = Math.max(0, Number(input.value) || 0);
      const p = meilleurPour(budget);

      if (!p) {
        const mini = Math.min(...PRODUCTS.map((x) => x.price));
        res.innerHTML = `<p class="bg-vide">Rien en dessous de ${fmt(mini)} pour l'instant —
          essayez un peu plus haut.</p>`;
        return;
      }

      const eco = p.oldPrice ? p.oldPrice - p.price : 0;
      res.innerHTML = `
        <article class="bg-card" data-id="${p.id}">
          <div class="bg-top">
            <span class="bg-cat">${CATS[p.category] || p.category}</span>
            <span class="bg-note">${p.perf}<i>/100</i></span>
          </div>
          <h3>${p.name}</h3>
          <p class="bg-specs">${p.specs.join(" · ")}</p>
          <div class="bg-prix">
            <strong>${fmt(p.price)}</strong>
            ${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s>` : ""}
          </div>
          ${eco > 0 ? `<p class="bg-eco">Vous économisez <strong>${fmt(eco)}</strong> sur le neuf</p>` : ""}
          ${p.condition ? `<p class="bg-gar">${p.condition === "reconditionne" ? "Reconditionné" : "Neuf"} · garanti ${p.warranty} mois</p>` : ""}
          <button type="button" class="btn btn-primary bg-cta" data-see="${p.id}">Voir cette offre</button>
        </article>`;

      if (typeof gsap !== "undefined" && !reduced) {
        gsap.from(res.querySelector(".bg-card"), { y: 12, opacity: 0, duration: .38, ease: "power3.out" });
      }
    }

    let deb;
    input.addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(rendre, 180); });

    quick.addEventListener("click", (e) => {
      const b = e.target.closest("[data-b]");
      if (!b) return;
      input.value = b.dataset.b;
      quick.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      rendre();
    });

    res.addEventListener("click", (e) => {
      const b = e.target.closest("[data-see]");
      if (b) openSheet(b.dataset.see);
    });

    rendre();
  })();

  /* ============ RETOUR STRIPE ============ */
  // Après paiement, Stripe redirige vers "/?stripe=success&session_id=..." (ou stripe=cancel).
  // La commande est déjà enregistrée côté serveur (webhook ou vérification ci-dessous) —
  // ce bloc ne fait qu'informer l'utilisateur et nettoyer l'URL/le panier.
  (async () => {
    const params = new URLSearchParams(location.search);
    const outcome = params.get("stripe");
    if (!outcome) return;

    if (outcome === "success") {
      const sessionId = params.get("session_id");
      try {
        const r = await fetch(`/api/stripe/verify-session/${encodeURIComponent(sessionId || "")}`, { credentials: "include" });
        const data = await r.json();
        if (data.paid) {
          Object.keys(cart).forEach((k) => delete cart[k]);
          renderCart();
          toast(`Paiement confirmé — commande ${data.orderRef || ""} enregistrée`);
        } else {
          toast("Paiement non confirmé pour l'instant, réessaie dans un instant.");
        }
      } catch {
        toast("Paiement effectué, mais impossible de confirmer avec le serveur.");
      }
    } else if (outcome === "cancel") {
      toast("Paiement annulé.");
    }

    params.delete("stripe"); params.delete("session_id");
    const clean = location.pathname + (params.toString() ? `?${params}` : "") + location.hash;
    history.replaceState({}, "", clean);
  })();

  /* ============ INIT ============ */
  axisEl.value = 50;
  budgetEl.max = BUDGET_MAX;
  budgetEl.value = BUDGET_MAX;
  updateBudgetUI();
  updateAxisUI();
  render();
  renderCart();

  MWVisuals.initBackground();
  MWVisuals.initCursor();
  MWVisuals.bindTilt();
  MWVisuals.initHero();
  if (typeof MWMotion !== "undefined") MWMotion.init();
})();
