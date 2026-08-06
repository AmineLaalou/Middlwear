// Commandes — enregistrement des achats (checkout maquette) + stats de vente.
"use strict";

const { Router } = require("express");
const { createOrder, listOrders, getStats, findById } = require("../db");
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
    createdAt: o.created_at,
    user: o.user_id ? (findById(o.user_id) || {}).email || null : null
  }));
  res.json({ orders });
});

router.get("/stats", requireAdmin, (req, res) => {
  res.json(getStats());
});

module.exports = router;
