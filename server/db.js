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

  CREATE TABLE IF NOT EXISTS orders (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    order_ref         TEXT NOT NULL UNIQUE,
    user_id           INTEGER REFERENCES users(id),
    customer_name     TEXT NOT NULL,
    customer_phone    TEXT,
    customer_city     TEXT,
    customer_address  TEXT,
    items_json        TEXT NOT NULL,
    subtotal          INTEGER NOT NULL,
    shipping          INTEGER NOT NULL,
    total             INTEGER NOT NULL,
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
  );
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

function createOrder({ orderRef, userId, customerName, customerPhone, customerCity, customerAddress, items, subtotal, shipping, total }) {
  db.prepare(`
    INSERT INTO orders (order_ref, user_id, customer_name, customer_phone, customer_city, customer_address, items_json, subtotal, shipping, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(orderRef, userId || null, customerName, customerPhone || null, customerCity || null, customerAddress || null, JSON.stringify(items), subtotal, shipping, total);
  return db.prepare("SELECT * FROM orders WHERE order_ref = ?").get(orderRef);
}

function listOrders() {
  return db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
}

function getStats() {
  const orders = listOrders();
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const ordersToday = orders.filter((o) => o.created_at.startsWith(today)).length;

  const productMap = new Map();
  for (const o of orders) {
    let items;
    try { items = JSON.parse(o.items_json); } catch { items = []; }
    for (const it of items) {
      const cur = productMap.get(it.id) || { id: it.id, name: it.name, qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue += it.price * it.qty;
      productMap.set(it.id, cur);
    }
  }
  const topProducts = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  return { totalOrders, totalRevenue, avgOrderValue, ordersToday, topProducts };
}

module.exports = {
  db, findByEmail, findByProvider, findById, createLocalUser, upsertOAuthUser,
  createOrder, listOrders, getStats
};
