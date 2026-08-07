# Guide des nouveautés — dashboard admin & paiement Stripe

Ce guide couvre uniquement ce qui vient d'être ajouté. Pour le reste
(lancer le site, comptes utilisateurs, connexion sociale, déploiement),
voir `README.md` et `DEPLOIEMENT.md`.

Tout ce qui suit nécessite le **mode complet** (`run-full.bat` /
`run-full.sh`, voir `README.md`) — le mode statique ne change pas.

---

## 1. Ce qui a été ajouté

### Tableau de bord admin (`admin.html`)
- **Utilisateurs inscrits** : nouveau panneau listant nom, email, mode de
  connexion (local/Google/Facebook) et nombre de commandes par compte.
- **Statut de commande** : chaque commande a désormais un statut *En
  attente / Expédiée / Livrée*, modifiable directement depuis le tableau
  (menu déroulant dans la colonne "Statut").
- **Recherche & filtre** : barre de recherche (réf., client, ville) +
  filtre par plage de dates au-dessus du tableau des commandes.
- **Export CSV** : bouton "Exporter en CSV" — télécharge les commandes
  actuellement affichées (donc filtrées si tu as tapé une recherche),
  ouvrable dans Excel/Google Sheets.
- **Colonne Paiement** : distingue les commandes *Démo* (maquette,
  aucun vrai paiement) des commandes *Stripe · payé* / *Stripe · en attente*.

Rien à configurer pour ces quatre points : ils fonctionnent dès que tu
relances le serveur (`run-full.bat`).

### Paiement réel via Stripe
Le tunnel de paiement maquette (formulaire de carte factice) reste le
comportement par défaut, **inchangé**, tant que Stripe n'est pas configuré.
Une fois activé (section 2 ci-dessous), l'étape "Paiement" du checkout
affiche à la place un bouton **"Payer avec Stripe"** qui redirige vers la
page de paiement sécurisée hébergée par Stripe — aucune donnée de carte ne
transite par ton site.

Comment ça marche techniquement (utile si tu veux comprendre ou déboguer) :
1. Le client clique "Payer avec Stripe" → le site crée une session de
   paiement Stripe et une commande en base avec le statut
   `awaiting_payment` (visible dans le dashboard en "Stripe · en attente").
2. Le client paie sur la page Stripe, puis est renvoyé sur ton site.
3. La commande passe à `paid` par l'une de ces deux voies (une seule
   suffit, les deux sont actives en parallèle par sécurité) :
   - le **webhook** Stripe (fiable, recommandé en production),
   - une **vérification automatique** faite par le site au retour
     (pratique en local, où Stripe ne peut pas joindre `localhost`).
4. Le dashboard admin (`/api/stats`) ne compte que les commandes *payées*
   dans le chiffre d'affaires — une session Stripe abandonnée sans
   paiement n'apparaît pas dans les stats de vente.

---

## 2. Activer la connexion Google / Facebook

Le code de connexion sociale existe déjà (`server/routes/oauth.js`) mais
reste inactif tant qu'aucune clé n'est renseignée — les boutons Google/
Facebook/Instagram sont grisés dans la modale de connexion. Voici comment
les activer (Google et Facebook ; Instagram est plus contraignant, voir
note en fin de section).

### Google
1. https://console.cloud.google.com/ → crée un projet si besoin.
2. **APIs & Services → OAuth consent screen** → type "External" → renseigne
   le nom de l'app ("Middlwear") et ton email → Save. Tant que l'app reste
   en statut "Testing", ajoute ton propre email dans **Test users** (sinon
   Google refusera la connexion, y compris la tienne).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
4. Type d'application : **Web application**
5. Origine JavaScript autorisée : `http://localhost:3000`
6. URI de redirection autorisée : `http://localhost:3000/api/auth/google/callback`
7. Copie le **Client ID** et le **Client secret** dans `server/.env` :
   ```
   GOOGLE_CLIENT_ID=<colle-ton-client-id>.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=<colle-ton-client-secret>
   ```

### Facebook
1. https://developers.facebook.com/apps → **Créer une application** → type "Consommateur"
2. Ajoute le produit **Facebook Login**
3. **Paramètres → URI de redirection OAuth valides** :
   `http://localhost:3000/api/auth/facebook/callback`
4. Récupère l'**ID de l'application** et la **Clé secrète** (Paramètres de
   base de l'app) dans `server/.env` :
   ```
   FACEBOOK_CLIENT_ID=<colle-ton-id-app>
   FACEBOOK_CLIENT_SECRET=<colle-ta-cle-secrete>
   ```

### Relance et teste
```bash
run-full.bat
```
Les boutons Google/Facebook deviennent actifs dans la modale de connexion
dès que la clé correspondante est présente — pas besoin de configurer les
deux, chacun s'active indépendamment.

### Instagram (optionnel, plus contraignant)
Nécessite un compte Instagram **professionnel** côté utilisateur final, et
utilise la nouvelle "Instagram API with Instagram Login" (l'ancienne
"Instagram Basic Display API" est arrêtée depuis fin 2024). Marche à suivre
et avertissement sur l'instabilité des noms d'endpoints/scopes Meta :
voir les commentaires dans `server/.env.example`.

### Avant de déployer en ligne
Une fois le site en production (voir `DEPLOIEMENT.md`, niveau 4/5), remplace
`http://localhost:3000` par l'URL réelle dans :
- `BASE_URL` de `server/.env`
- les URI de redirection déclarées côté Google/Meta (étapes 5-6 ci-dessus)

---

## 3. Activer Stripe — étape par étape

### a) Crée ton compte Stripe
1. https://dashboard.stripe.com/register
2. Reste en **mode Test** (bascule visible en haut du dashboard) tant que
   tu ne veux pas encaisser de vrais paiements — tout fonctionne pareil,
   avec de fausses cartes de test.

### b) Récupère ta clé secrète
1. https://dashboard.stripe.com/test/apikeys
2. Copie la **Clé secrète** (commence par `sk_test_...`)
3. Ouvre `server/.env` (crée-le depuis `server/.env.example` si besoin) et colle-la :
   ```
   STRIPE_SECRET_KEY=<colle-ta-cle-secrete-sk_test>
   ```

### c) Vérifie la devise
```
STRIPE_CURRENCY=mad
```
Le Dirham marocain (MAD) doit être activé sur ton compte : **Paramètres →
Devises de paiement** dans le dashboard Stripe. Si ce n'est pas le cas,
change temporairement `STRIPE_CURRENCY` pour une devise déjà activée
(ex. `eur`, `usd`) le temps de l'activer.

### d) Webhook (recommandé, notamment en production)

**En local**, avec la [Stripe CLI](https://docs.stripe.com/stripe-cli) :
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
La commande affiche une clé `whsec_...` à coller dans `server/.env` :
```
STRIPE_WEBHOOK_SECRET=<colle-le-whsec-affiche>
```
Laisse cette commande tourner dans un terminal pendant que tu testes.

**Sans Stripe CLI** : ce n'est pas bloquant en local — la vérification
automatique au retour (étape 3 ci-dessus) prend le relais. Le webhook
devient nécessaire surtout une fois le site déployé en ligne.

**En production** (une fois le site déployé, voir `DEPLOIEMENT.md`) :
1. https://dashboard.stripe.com/webhooks → **Ajouter un endpoint**
2. URL : `https://ton-domaine.com/api/stripe/webhook`
3. Événement à écouter : `checkout.session.completed`
4. Copie le "Signing secret" affiché dans `STRIPE_WEBHOOK_SECRET`

### e) Relance le serveur
```bash
run-full.bat
```
(ou `./run-full.sh`). Le bouton de paiement passe automatiquement en mode
Stripe — rien d'autre à changer côté site.

### f) Teste avec une carte de test
Sur la page Stripe, utilise par exemple :
- Numéro : `4242 4242 4242 4242`
- Date : n'importe quelle date future
- CVC : n'importe quel 3 chiffres

La commande doit apparaître dans `admin.html` avec le badge
**"Stripe · payé"** après paiement.

### g) Passer en vrais paiements
Quand tu es prêt·e à encaisser de vrais clients : bascule ton dashboard
Stripe en **mode Live** (en haut du dashboard), récupère les clés `sk_live_...`
et le webhook `whsec_...` correspondants (mêmes étapes qu'au-dessus mais
avec l'interface "Live"), et remplace-les dans `server/.env` de ton
hébergement en production. Vérifie aussi que Stripe est disponible pour
encaisser au Maroc avec ton type de compte (conditions à confirmer
directement sur https://stripe.com/global au moment de l'activation).

---

## 4. Où sont les nouveaux fichiers

```
server/routes/stripe.js   création de session, vérification, webhook
server/db.js              colonnes payment_provider / payment_status / payment_ref
                           + statut de commande + liste des utilisateurs
server/routes/orders.js   routes /api/orders/:ref/status et /api/users
admin.html                utilisateurs, statuts, recherche/filtre, export CSV
js/app.js, index.html     bascule automatique maquette ⇄ Stripe au paiement
```

## 5. Limites à connaître
- Les prix envoyés à Stripe viennent du panier côté client (comme pour la
  maquette actuelle) — suffisant pour une démo, mais pour une vraie
  boutique en production il vaudrait mieux revalider les prix côté serveur
  contre un catalogue de confiance avant de créer la session de paiement.
- La base SQLite n'est pas persistante sur certains hébergeurs gratuits
  (voir "Niveau 4 — Render" dans `DEPLOIEMENT.md`) — à garder en tête avant
  d'encaisser de vrais paiements en production.
