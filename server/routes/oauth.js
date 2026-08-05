// Connexion sociale — Google / Facebook / Instagram.
//
// Flux OAuth2 "Authorization Code" générique et identique pour les 3 fournisseurs :
//   1) GET  /api/auth/:provider          -> redirige vers l'écran de consentement du fournisseur
//   2) GET  /api/auth/:provider/callback -> échange le code contre un token, récupère le profil,
//                                            crée/relie le compte en base, pose le cookie de session
//
// Chaque fournisseur reste DÉSACTIVÉ tant que ses variables CLIENT_ID / CLIENT_SECRET ne sont
// pas renseignées dans server/.env — voir server/.env.example pour la procédure d'obtention
// (Google Cloud Console / Meta for Developers). Rien ne casse si elles sont absentes : l'utilisateur
// est renvoyé vers l'accueil avec un message clair.
"use strict";

const { Router } = require("express");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const { upsertOAuthUser } = require("../db");
const { issueSession } = require("../lib/session");

const router = Router();

const STATE_SECRET = process.env.JWT_SECRET || "dev-secret-change-me-please";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const FRONTEND_REDIRECT = "/"; // page vers laquelle on renvoie l'utilisateur après connexion

function redirectUri(provider) {
  return `${BASE_URL}/api/auth/${provider}/callback`;
}

const PROVIDERS = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    extraAuthParams: { access_type: "online", prompt: "select_account" },
    async fetchProfile(accessToken) {
      const r = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!r.ok) throw new Error("google userinfo failed");
      const p = await r.json();
      return { providerId: p.sub, email: p.email || null, name: p.name || p.email, avatarUrl: p.picture || null };
    }
  },

  facebook: {
    authUrl: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v21.0/oauth/access_token",
    scope: "email public_profile",
    clientId: () => process.env.FACEBOOK_CLIENT_ID,
    clientSecret: () => process.env.FACEBOOK_CLIENT_SECRET,
    async fetchProfile(accessToken) {
      const r = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${encodeURIComponent(accessToken)}`
      );
      if (!r.ok) throw new Error("facebook profile failed");
      const p = await r.json();
      return { providerId: p.id, email: p.email || null, name: p.name, avatarUrl: p.picture?.data?.url || null };
    }
  },

  // NB : Meta a remplacé l'ancienne "Instagram Basic Display API" (arrêtée en 2024) par
  // "Instagram API with Instagram Login". Elle exige un compte Instagram professionnel
  // (créateur/entreprise) côté utilisateur final, et une appli Meta configurée en conséquence.
  // Vérifie les noms d'endpoints/scopes à jour dans la doc Meta au moment de la configuration :
  // ils évoluent plus souvent que ceux de Google/Facebook.
  instagram: {
    authUrl: "https://www.instagram.com/oauth/authorize",
    tokenUrl: "https://api.instagram.com/oauth/access_token",
    scope: "instagram_business_basic",
    clientId: () => process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: () => process.env.INSTAGRAM_CLIENT_SECRET,
    async fetchProfile(accessToken, tokenPayload) {
      const userId = tokenPayload.user_id;
      const r = await fetch(
        `https://graph.instagram.com/${userId}?fields=id,username,name,profile_picture_url&access_token=${encodeURIComponent(accessToken)}`
      );
      if (!r.ok) throw new Error("instagram profile failed");
      const p = await r.json();
      // Instagram ne fournit pas d'email — le compte est relié par provider_id, pas par email.
      return { providerId: String(p.id), email: null, name: p.name || p.username, avatarUrl: p.profile_picture_url || null };
    }
  }
};

function signState() {
  return jwt.sign({ n: crypto.randomBytes(8).toString("hex") }, STATE_SECRET, { expiresIn: "10m" });
}
function verifyState(state) {
  try { jwt.verify(state, STATE_SECRET); return true; } catch { return false; }
}

// Doit être déclarée AVANT "/:provider" pour ne pas être interprétée comme un nom de fournisseur.
router.get("/providers", (req, res) => {
  res.json({
    google: Boolean(PROVIDERS.google.clientId()),
    facebook: Boolean(PROVIDERS.facebook.clientId()),
    instagram: Boolean(PROVIDERS.instagram.clientId())
  });
});

router.get("/:provider", (req, res) => {
  const provider = PROVIDERS[req.params.provider];
  if (!provider) return res.status(404).send("Fournisseur inconnu.");

  const clientId = provider.clientId();
  if (!clientId) {
    return res.redirect(`${FRONTEND_REDIRECT}?authError=not_configured&provider=${req.params.provider}`);
  }

  const state = signState();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri(req.params.provider),
    response_type: "code",
    scope: provider.scope,
    state,
    ...(provider.extraAuthParams || {})
  });
  res.redirect(`${provider.authUrl}?${params.toString()}`);
});

router.get("/:provider/callback", async (req, res) => {
  const name = req.params.provider;
  const provider = PROVIDERS[name];
  if (!provider) return res.status(404).send("Fournisseur inconnu.");

  const { code, state, error } = req.query;
  if (error) return res.redirect(`${FRONTEND_REDIRECT}?authError=denied&provider=${name}`);
  if (!code || !state || !verifyState(state)) {
    return res.redirect(`${FRONTEND_REDIRECT}?authError=invalid_state&provider=${name}`);
  }

  try {
    const clientId = provider.clientId();
    const clientSecret = provider.clientSecret();
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri(name),
      grant_type: "authorization_code",
      code
    });

    const tokenRes = await fetch(provider.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    if (!tokenRes.ok) throw new Error(`token exchange failed (${tokenRes.status})`);
    const tokenPayload = await tokenRes.json();
    const accessToken = tokenPayload.access_token;
    if (!accessToken) throw new Error("no access_token in response");

    const profile = await provider.fetchProfile(accessToken, tokenPayload);
    const user = upsertOAuthUser({
      provider: name,
      providerId: profile.providerId,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl
    });

    issueSession(res, user);
    res.redirect(FRONTEND_REDIRECT);
  } catch (err) {
    console.error(`[middlwear] OAuth ${name} a échoué:`, err.message);
    res.redirect(`${FRONTEND_REDIRECT}?authError=exchange_failed&provider=${name}`);
  }
});

module.exports = router;
