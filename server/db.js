// Base de données utilisateurs — SQLite embarqué (module natif Node, aucune dépendance
// externe à compiler). Fichier stocké dans server/data/middlwear.sqlite.
"use strict";

const path = require("node:path");
const fs = require("node:fs");
const { DatabaseSync } = require("node:sqlite");

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, "middlwear.sqlite"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE,
    password_hash TEXT,
    name          TEXT NOT NULL,
    provider      TEXT NOT NULL DEFAULT 'local',
    provider_id   TEXT,
    avatar_url    TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider
    ON users(provider, provider_id) WHERE provider_id IS NOT NULL;
`);

function findByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) || null;
}

function findByProvider(provider, providerId) {
  return db.prepare("SELECT * FROM users WHERE provider = ? AND provider_id = ?").get(provider, providerId) || null;
}

function findById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) || null;
}

function createLocalUser({ email, passwordHash, name }) {
  const info = db.prepare(
    "INSERT INTO users (email, password_hash, name, provider) VALUES (?, ?, ?, 'local')"
  ).run(email, passwordHash, name);
  return findById(Number(info.lastInsertRowid));
}

function upsertOAuthUser({ provider, providerId, email, name, avatarUrl }) {
  const existing = findByProvider(provider, providerId);
  if (existing) return existing;

  // Même email déjà inscrit en local : on relie le compte au lieu d'en créer un doublon.
  if (email) {
    const byEmail = findByEmail(email);
    if (byEmail) {
      db.prepare("UPDATE users SET provider = ?, provider_id = ?, avatar_url = COALESCE(?, avatar_url) WHERE id = ?")
        .run(provider, providerId, avatarUrl || null, byEmail.id);
      return findById(byEmail.id);
    }
  }

  const info = db.prepare(
    "INSERT INTO users (email, name, provider, provider_id, avatar_url) VALUES (?, ?, ?, ?, ?)"
  ).run(email || null, name || provider, provider, providerId, avatarUrl || null);
  return findById(Number(info.lastInsertRowid));
}

module.exports = { db, findByEmail, findByProvider, findById, createLocalUser, upsertOAuthUser };
