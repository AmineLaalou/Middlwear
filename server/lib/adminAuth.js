// Protège les endpoints d'administration (liste des commandes, stats) avec
// une clé partagée — volontairement simple (pas de vrai compte admin) mais
// suffisant pour éviter qu'un lien public/tunnel expose les données clients
// à n'importe qui. Sans ADMIN_KEY configurée, l'accès est refusé par défaut.
"use strict";

function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_KEY;
  if (!expected) {
    return res.status(503).json({ error: "ADMIN_KEY non configurée côté serveur (voir server/.env.example)." });
  }
  const provided = req.get("x-admin-key");
  if (provided !== expected) {
    return res.status(403).json({ error: "Clé admin invalide." });
  }
  next();
}

module.exports = { requireAdmin };
