/* MIDDLWEAR — comptes utilisateurs (email/mot de passe + connexion sociale)
   Parle au backend server/ via des routes /api/auth/*. Si le site est ouvert
   en statique (sans "node server/server.js"), ces appels échouent simplement
   et le bouton "Se connecter" reste inactif — le reste du site continue de
   fonctionner normalement. */

const MWAuth = (() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  let mode = "login"; // "login" | "register"
  let currentUser = null;

  function toast(msg) {
    const t = $("toast");
    if (!t) return;
    t.innerHTML = (window.ICONS ? ICONS.check : "") + `<span>${msg}</span>`;
    t.classList.add("on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("on"), 2600);
  }

  /* ---------- Modale connexion / inscription ---------- */
  const amodal = () => $("amodal");
  const aovl = () => $("aovl");

  function openModal() {
    amodal().classList.add("on");
    aovl().classList.add("on");
    document.body.classList.add("modal-open");
    $("aerr").style.display = "none";
  }
  function closeModal() {
    amodal().classList.remove("on");
    aovl().classList.remove("on");
    document.body.classList.remove("modal-open");
  }

  function setMode(next) {
    mode = next;
    $("atab-login").classList.toggle("on", mode === "login");
    $("atab-register").classList.toggle("on", mode === "register");
    $("fld-name").style.display = mode === "register" ? "flex" : "none";
    $("a-password").autocomplete = mode === "register" ? "new-password" : "current-password";
    $("a-submit").textContent = mode === "register" ? "Créer mon compte" : "Se connecter";
    $("aerr").style.display = "none";
  }

  function showError(msg) {
    const el = $("aerr");
    el.textContent = msg;
    el.style.display = "block";
  }

  /* ---------- État utilisateur / header ---------- */
  function renderHeader() {
    const btn = $("acct-btn"), label = $("acct-label");
    if (currentUser) {
      btn.classList.add("logged");
      label.textContent = currentUser.name || currentUser.email || "Compte";
      $("acct-drop-name").textContent = currentUser.name || "—";
      $("acct-drop-email").textContent = currentUser.email || "Connecté via " + currentUser.provider;
    } else {
      btn.classList.remove("logged");
      label.textContent = "Se connecter";
      closeDrop();
    }
  }

  function openDrop() { $("acct-drop").classList.add("on"); }
  function closeDrop() { $("acct-drop").classList.remove("on"); }

  async function refreshUser() {
    try {
      const r = await fetch("/api/auth/me", { credentials: "include" });
      const data = await r.json();
      currentUser = data.user || null;
    } catch {
      currentUser = null; // backend statique/indisponible : mode dégradé silencieux
    }
    renderHeader();
    return currentUser;
  }

  /* ---------- Popup de connexion automatique (façon grands sites) ---------- */
  const AUTO_PROMPT_DELAY_MS = 7000;
  const AUTO_PROMPT_KEY = "mw_auth_prompted";

  function maybeAutoPrompt(skip) {
    if (skip || currentUser || sessionStorage.getItem(AUTO_PROMPT_KEY)) return;
    setTimeout(() => {
      if (currentUser || amodal().classList.contains("on") || document.body.classList.contains("modal-open")) return;
      sessionStorage.setItem(AUTO_PROMPT_KEY, "1");
      setMode("login");
      openModal();
    }, AUTO_PROMPT_DELAY_MS);
  }

  async function refreshSocialButtons() {
    let providers = {};
    try {
      const r = await fetch("/api/auth/providers", { credentials: "include" });
      providers = await r.json();
    } catch {
      providers = {};
    }
    [["soc-google", "google"], ["soc-facebook", "facebook"], ["soc-instagram", "instagram"]].forEach(([id, key]) => {
      const el = $(id);
      if (!el) return;
      const active = Boolean(providers[key]);
      el.classList.toggle("disabled", !active);
      if (!active) el.addEventListener("click", (e) => e.preventDefault());
    });
  }

  /* ---------- Init ---------- */
  function init() {
    $("acct-btn").addEventListener("click", () => {
      if (currentUser) {
        $("acct-drop").classList.contains("on") ? closeDrop() : openDrop();
      } else {
        setMode("login");
        openModal();
      }
    });

    document.addEventListener("click", (e) => {
      if (!$("acct-drop").contains(e.target) && !$("acct-btn").contains(e.target)) closeDrop();
    });

    $("aclose").addEventListener("click", closeModal);
    aovl().addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

    $("atab-login").addEventListener("click", () => setMode("login"));
    $("atab-register").addEventListener("click", () => setMode("register"));

    $("aform").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = $("a-email").value.trim();
      const password = $("a-password").value;
      const name = $("a-name").value.trim();

      if (!email || !password || (mode === "register" && !name)) {
        showError("Merci de remplir tous les champs.");
        return;
      }

      const btn = $("a-submit");
      btn.disabled = true;
      try {
        const r = await fetch(`/api/auth/${mode === "register" ? "register" : "login"}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(mode === "register" ? { email, password, name } : { email, password })
        });
        const data = await r.json();
        if (!r.ok) { showError(data.error || "Une erreur est survenue."); return; }
        currentUser = data.user;
        renderHeader();
        closeModal();
        toast(mode === "register" ? "Compte créé, bienvenue !" : "Connecté");
        $("aform").reset();
      } catch {
        showError("Impossible de joindre le serveur. Le site tourne-t-il en mode complet (node server/server.js) ?");
      } finally {
        btn.disabled = false;
      }
    });

    $("acct-logout").addEventListener("click", async () => {
      try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
      currentUser = null;
      renderHeader();
      toast("Déconnecté");
    });

    // Retour d'un flux OAuth (voir server/routes/oauth.js) : ?authError=...&provider=...
    const params = new URLSearchParams(location.search);
    const err = params.get("authError");
    const skipAutoPrompt = Boolean(err); // on ne relance pas le popup juste après une tentative de connexion
    if (err) {
      const provider = params.get("provider") || "";
      const messages = {
        not_configured: `Connexion ${provider} pas encore configurée côté serveur (clé API manquante).`,
        denied: "Connexion annulée.",
        invalid_state: "Session de connexion expirée, réessaie.",
        exchange_failed: `Échec de la connexion ${provider}. Réessaie dans un instant.`
      };
      toast(messages[err] || "Échec de la connexion.");
      params.delete("authError"); params.delete("provider");
      const clean = location.pathname + (params.toString() ? `?${params}` : "") + location.hash;
      history.replaceState({}, "", clean);
    }

    refreshUser().then(() => maybeAutoPrompt(skipAutoPrompt));
    refreshSocialButtons();
  }

  init(); // script chargé en fin de <body>, le DOM est déjà prêt (même pattern que app.js)
  return { refreshUser };
})();
