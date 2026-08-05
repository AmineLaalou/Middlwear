"use strict";

const { Router } = require("express");
const bcrypt = require("bcryptjs");
const { findByEmail, createLocalUser, findById } = require("../db");
const { issueSession, clearSession, readUserId, publicUser } = require("../lib/session");

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: "Email invalide." });
  if (!password || password.length < 8) return res.status(400).json({ error: "Mot de passe trop court (8 caractères minimum)." });
  if (!name || !name.trim()) return res.status(400).json({ error: "Nom requis." });

  if (findByEmail(email)) return res.status(409).json({ error: "Un compte existe déjà avec cet email." });

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = createLocalUser({ email: email.toLowerCase(), passwordHash, name: name.trim() });

  issueSession(res, user);
  res.status(201).json({ user: publicUser(user) });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = email ? findByEmail(email.toLowerCase()) : null;

  if (!user || !user.password_hash || !bcrypt.compareSync(password || "", user.password_hash)) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect." });
  }

  issueSession(res, user);
  res.json({ user: publicUser(user) });
});

router.post("/logout", (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  const id = readUserId(req);
  const user = id ? findById(id) : null;
  if (!user) return res.status(401).json({ user: null });
  res.json({ user: publicUser(user) });
});

module.exports = router;
