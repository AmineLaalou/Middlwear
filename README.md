# Middlwear — boutique tech

## ⚠️ Si tu vois l'ancien site en lançant run.bat
C'est le **cache du navigateur**. Deux solutions :
- `Ctrl + F5` (ou `Ctrl + Shift + R`) une fois la page ouverte
- ou ouvre en navigation privée

Vérifie aussi que tu lances bien le `run.bat` **de ce dossier-ci**, et
qu'aucun ancien serveur ne tourne déjà sur le port 8000 / 3000.

## Deux façons de lancer le site

### Mode statique — sans comptes utilisateurs
- **Windows** : double-clic sur `run.bat`
- **Mac / Linux** : double-clic sur `run.sh` (ou `./run.sh`)
- **Sans serveur** : ouvre `index.html` directement

Le bouton "Se connecter" reste présent mais inactif (aucun backend à
contacter) — tout le reste du site (catalogue, panier, checkout maquette)
fonctionne normalement. C'est ce mode que Netlify Drop / GitHub Pages
déploient (voir `DEPLOIEMENT.md`).

### Mode complet — comptes, authentification, connexion sociale
Nécessite [Node.js](https://nodejs.org) 22+ installé.
- **Windows** : double-clic sur `run-full.bat`
- **Mac / Linux** : `./run-full.sh`

La première exécution installe les dépendances (`server/node_modules`) et
crée `server/.env` à partir de `server/.env.example`. Le site est alors
servi sur `http://localhost:3000`, avec en plus :
- Création de compte / connexion par email + mot de passe
- Connexion via Google, Facebook ou Instagram — **désactivée tant que tu
  n'as pas renseigné les clés API correspondantes dans `server/.env`**
  (instructions détaillées dans ce fichier)
- Une vraie base de données utilisateurs **et commandes** (SQLite, fichier
  `server/data/middlwear.sqlite`, jamais commité sur git)
- Un tableau de bord (`admin.html`) avec les statistiques de vente —
  voir "Commandes & tableau de bord" plus bas

## Nouveautés de cette version
- **Ton logo** partout : intro, header, hero flottant, footer
- **Curseur Économique ⇄ Performance** sous la recherche : à gauche le
  classement privilégie le budget, à droite la performance pure. Le libellé
  et la couleur du curseur s'adaptent en direct, et chaque produit affiche
  son indice de performance.
- **3D & animations** : scène WebGL dans le hero (Three.js), champ de
  particules connectées en fond, cartes avec inclinaison 3D au survol,
  halo de curseur, révélations au scroll, bandeau défilant, toasts.

## Dépendances
Three.js est chargé depuis un CDN. **Si le CDN est injoignable ou que tu es
hors ligne, le site bascule automatiquement sur un cube 3D en CSS** — rien
ne casse. Tout le reste (particules, tilt, animations) est fait main, sans
aucune dépendance.

## Structure
```
middlwear/
├── index.html
├── css/style.css
├── js/
│   ├── data.js      catalogue + indices de performance
│   ├── icons.js     icônes SVG
│   ├── visuals.js   3D, particules, tilt, curseur, reveals
│   ├── auth.js      compte : modale connexion/inscription, OAuth, header
│   └── app.js       filtres, panier, checkout
├── assets/          logo (monogramme + version complète)
├── server/          backend mode complet (comptes, auth, OAuth, commandes)
│   ├── server.js    point d'entrée Express (sert aussi le site statique)
│   ├── db.js        base SQLite (module natif node:sqlite)
│   ├── lib/session.js
│   ├── lib/adminAuth.js  protège /api/orders et /api/stats
│   ├── routes/auth.js    register / login / logout / me
│   ├── routes/oauth.js   Google / Facebook / Instagram
│   ├── routes/orders.js  enregistrement des commandes + stats de vente
│   └── .env.example      clés API à renseigner (voir ce fichier)
├── admin.html       tableau de bord (commandes, chiffre d'affaires, top ventes)
├── run.sh / run.bat           mode statique
├── run-full.sh / run-full.bat mode complet (comptes + auth)
└── README.md
```

## Comptes utilisateurs & connexion sociale
Voir `server/.env.example` pour la procédure complète d'obtention des clés
Google / Facebook / Instagram. Résumé :
- Sans clé configurée pour un fournisseur : son bouton reste grisé, rien ne
  casse.
- Les mots de passe sont hashés (bcrypt), la session est un cookie JWT
  `httpOnly` — jamais accessible en JavaScript côté navigateur.
- Instagram est le plus contraignant : nécessite un compte Instagram
  **professionnel** côté utilisateur final, et l'ancienne "Instagram Basic
  Display API" est arrêtée depuis fin 2024 — le code utilise la nouvelle
  "Instagram API with Instagram Login".

## Commandes & tableau de bord (mode complet)
Chaque commande validée (checkout maquette) est enregistrée dans la base —
nom, ville, articles, montants — et reliée au compte si l'acheteur est
connecté. Le tableau de bord `http://localhost:3000/admin.html` affiche le
nombre de commandes, le chiffre d'affaires, le panier moyen et les
meilleures ventes.

Protégé par une clé (`ADMIN_KEY` dans `server/.env`, générée automatiquement
au premier `run-full`) : sans elle, personne — pas même toi — ne peut lire
`/api/orders` ni `/api/stats`. Utile si tu partages un lien public (tunnel,
hébergement) : les visiteurs voient la boutique, pas la liste des clients.

## Paiement
Tunnel entièrement **simulé** (validation Luhn, format de date, confirmation).
Aucune carte n'est débitée, le numéro de carte ne quitte jamais le navigateur.
En mode complet, la commande (nom, ville, articles, montants) est en revanche
enregistrée en base pour faire fonctionner le tableau de bord ci-dessus — en
mode statique, rien n'est envoyé nulle part. Pour de vrais paiements il
faudra brancher CMI / Stripe avec ton propre compte marchand.
