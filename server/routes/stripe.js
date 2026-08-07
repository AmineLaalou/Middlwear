// Paiement réel — Stripe Checkout (page de paiement hébergée par Stripe).
//
// Reste DÉSACTIVÉ tant que STRIPE_SECRET_KEY n'est pas renseignée dans server/.env —
// voir server/.env.example pour la procédure. Sans elle, GET /config répond
// { enabled: false } et le site continue d'utiliser le tunnel de paiement maquette
// (voir js/app.js) : rien ne casse.
//
// Flux :
//   1) POST /create-checkout-session  -> crée une session Stripe + une commande en base
//      avec payment_status "awaiting_payment", renvoie l'URL de paiement Stripe
//   2) L'acheteur paie sur la page Stripe, puis est redirigé vers success_url/cancel_url
//   3) La commande passe à payment_status "paid" par DEUX voies (l'une suffit) :
//        a) POST /webhook — appelé par Stripe lui-même, source de vérité fiable en prod
//        b) GET /verify-session/:id — appelé par le site au retour, pratique en local
//           (un webhook ne peut pas atteindre localhost sans tunnel/Stripe CLI)
"use strict";

const express = require("express");
const { Router } = express;
const Stripe = require("stripe");
const { createOrder, markOrderPaid } = require("../db");
const { readUserId } = require("../lib/session");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CURRENCY = (process.env.STRIPE_CURRENCY || "mad").toLowerCase();

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

function genOrderRef() {
  return "MW-" + Math.floor(100000 + Math.random() * 899999);
}

/* ---------- Routes normales (montées après express.json()) ---------- */
const router = Router();

router.get("/config", (req, res) => {
  res.json({ enabled: Boolean(process.env.STRIPE_SECRET_KEY) });
});

router.post("/create-checkout-session", async (req, res) => {
  const stripe = getStripeClient();
  if (!stripe) return res.status(503).json({ error: "Stripe non configuré côté serveur (voir server/.env.example)." });

  const { items, shipping, subtotal, shippingCost, total } = req.body || {};
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Panier vide." });
  }
  if (!shipping || !shipping.name) {
    return res.status(400).json({ error: "Adresse de livraison manquante." });
  }
  if (![subtotal, shippingCost, total].every((n) => Number.isFinite(n))) {
    return res.status(400).json({ error: "Montants invalides." });
  }

  const cleanItems = items.map((it) => ({
    id: String(it.id || ""),
    name: String(it.name || "").slice(0, 200),
    price: Number(it.price) || 0,
    qty: Math.max(1, Number(it.qty) || 1)
  }));

  const lineItems = cleanItems.map((it) => ({
    price_data: {
      currency: CURRENCY,
      product_data: { name: it.name },
      unit_amount: Math.round(it.price * 100)
    },
    quantity: it.qty
  }));
  if (shippingCost > 0) {
    lineItems.push({
      price_data: { currency: CURRENCY, product_data: { name: "Livraison" }, unit_amount: Math.round(shippingCost * 100) },
      quantity: 1
    });
  }

  try {
    const orderRef = genOrderRef();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${BASE_URL}/?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/?stripe=cancel`,
      metadata: { orderRef }
    });

    createOrder({
      orderRef,
      userId: readUserId(req),
      customerName: String(shipping.name).slice(0, 200),
      customerPhone: shipping.phone ? String(shipping.phone).slice(0, 60) : null,
      customerCity: shipping.city ? String(shipping.city).slice(0, 120) : null,
      customerAddress: shipping.address ? String(shipping.address).slice(0, 300) : null,
      items: cleanItems,
      subtotal: Math.round(subtotal),
      shipping: Math.round(shippingCost),
      total: Math.round(total),
      paymentProvider: "stripe",
      paymentStatus: "awaiting_payment",
      paymentRef: session.id
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("[middlwear] Stripe create-checkout-session a échoué:", err.message);
    res.status(502).json({ error: "Impossible de contacter Stripe pour l'instant." });
  }
});

router.get("/verify-session/:id", async (req, res) => {
  const stripe = getStripeClient();
  if (!stripe) return res.status(503).json({ error: "Stripe non configuré." });

  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    if (session.payment_status === "paid") {
      const order = markOrderPaid(session.id);
      return res.json({ paid: true, orderRef: order ? order.order_ref : null });
    }
    res.json({ paid: false });
  } catch (err) {
    res.status(404).json({ error: "Session de paiement introuvable." });
  }
});

/* ---------- Webhook (monté AVANT express.json(), body brut requis pour la signature) ---------- */
const webhookRouter = Router();

webhookRouter.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const stripe = getStripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return res.status(503).end();

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], secret);
  } catch (err) {
    console.error("[middlwear] Signature webhook Stripe invalide:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    markOrderPaid(event.data.object.id);
  }
  res.json({ received: true });
});

module.exports = { router, webhookRouter };
