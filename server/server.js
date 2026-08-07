"use strict";

require("dotenv").config();

const path = require("node:path");
const express = require("express");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const oauthRoutes = require("./routes/oauth");
const ordersRoutes = require("./routes/orders");
const { router: stripeRoutes, webhookRouter: stripeWebhook } = require("./routes/stripe");

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_ROOT = path.join(__dirname, ".."); // dossier middlwear/ (index.html, css/, js/, assets/)

// Le webhook Stripe doit lire le corps brut (non parsé) pour vérifier sa signature —
// il est donc monté AVANT express.json(), qui parserait/consommerait sinon le corps.
app.use("/api/stripe", stripeWebhook);

app.use(express.json());
app.use(cookieParser());

// Routes API — auth.js gère les chemins fixes (/register, /login, /logout, /me),
// oauth.js gère les chemins dynamiques (/:provider, /:provider/callback) : l'ordre
// de montage compte, auth.js doit passer en premier pour ne pas être masqué.
app.use("/api/auth", authRoutes);
app.use("/api/auth", oauthRoutes);
app.use("/api", ordersRoutes);
app.use("/api/stripe", stripeRoutes);

app.use(express.static(SITE_ROOT));

app.listen(PORT, () => {
  console.log(`Middlwear (mode complet — comptes + auth) → http://localhost:${PORT}`);
});
