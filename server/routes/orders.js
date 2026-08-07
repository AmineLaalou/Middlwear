// Commandes — enregistrement des achats (checkout maquette) + stats de vente.
"use strict";

const { Router } = require("express");
const { createOrder, listOrders, updateOrderStatus, listUsers, getStats, findById, ORDER_STATUSES } = require("../db");
const { readUserId } = require("../lib/session");
const { requireAdmin } = require("../lib/adminAuth");

const router = Router();

router.post("/orders", (req, res) => {
  const { orderRef, items, shipping, subtotal, shippingCost, total } = req.body || {};

  if (!orderRef || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Commande invalide (référence ou articles manquants)." });
  }
  if (!shipping || !shipping.name) {
    return res.status(400).json({ error: "Adresse de livraison manquante." });
  }
  if (![subtotal, shippingCost, total].every((n) => Number.isFinite(n))) {
    return res.status(400).json({ error: "Montants invalides." });
  }

  const userId = readUserId(req);
  const cleanItems = items.map((it) => ({
    id: String(it.id || ""),
    name: String(it.name || "").slice(0, 200),
    price: Number(it.price) || 0,
    qty: Math.max(1, Number(it.qty) || 1)
  }));

  const order = createOrder({
    orderRef: String(orderRef).slice(0, 40),
    userId,
    customerName: String(shipping.name).slice(0, 200),
    customerPhone: shipping.phone ? String(shipping.phone).slice(0, 60) : null,
    customerCity: shipping.city ? String(shipping.city).slice(0, 120) : null,
    customerAddress: shipping.address ? String(shipping.address).slice(0, 300) : null,
    items: cleanItems,
    subtotal: Math.round(subtotal),
    shipping: Math.round(shippingCost),
    total: Math.round(total)
  });

  res.status(201).json({ ok: true, orderRef: order.order_ref });
});

router.get("/orders", requireAdmin, (req, res) => {
  const orders = listOrders().map((o) => ({
    ref: o.order_ref,
    customer: o.customer_name,
    phone: o.customer_phone,
    city: o.customer_city,
    address: o.customer_address,
    items: JSON.parse(o.items_json),
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    status: o.status,
    paymentProvider: o.payment_provider,
    paymentStatus: o.payment_status,
    createdAt: o.created_at,
    user: o.user_id ? (findById(o.user_id) || {}).email || null : null
  }));
  res.json({ orders });
});

router.patch("/orders/:ref/status", requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Statut invalide (attendu : ${ORDER_STATUSES.join(", ")}).` });
  }
  const order = updateOrderStatus(req.params.ref, status);
  if (!order) return res.status(404).json({ error: "Commande introuvable." });
  res.json({ ok: true, status: order.status });
});

router.get("/stats", requireAdmin, (req, res) => {
  res.json(getStats());
});

router.get("/users", requireAdmin, (req, res) => {
  const users = listUsers().map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    provider: u.provider,
    avatarUrl: u.avatar_url,
    orderCount: u.order_count,
    createdAt: u.created_at
  }));
  res.json({ users });
});

module.exports = router;
