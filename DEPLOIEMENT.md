# Mettre Middlwear en ligne (gratuitement)

Deux modes possibles, voir `README.md` pour le détail :

- **Mode statique** (niveaux 1 à 3 ci-dessous) : pas de serveur, pas de
  compte utilisateur.
- **Mode complet** (niveaux 4 et 5) : comptes, authentification, connexion
  sociale — nécessite un hébergeur qui fait tourner du Node.js en continu.

Classement du plus simple au plus complexe. **Toutes les options listées
sont gratuites**, sans carte bancaire requise pour démarrer (précision
donnée option par option ci-dessous).

---

## Niveau 1 — Netlify Drop (le plus rapide, ~1 minute, mode statique)

Aucun compte requis pour publier (juste pour garder le lien).

1. Décompresse le zip. Tu dois avoir un dossier `middlwear/` contenant
   `index.html`, `css/`, `js/`, `assets/`.
2. Va sur **https://app.netlify.com/drop**
3. Glisse-dépose le **dossier `middlwear`** (pas le .zip) dans la zone.
4. C'est en ligne. Tu obtiens une URL type `https://joyful-tesla-a1b2c3.netlify.app`

Le lien est temporaire tant que tu ne crées pas de compte. Crée un compte
gratuit (bouton proposé juste après) pour le garder et renommer le
sous-domaine en `middlwear.netlify.app` si c'est libre.

---

## Niveau 2 — Cloudflare Pages (mode statique, meilleure vitesse depuis le Maroc)

Nécessite de créer un compte gratuit avant de publier (léger cran de plus
que Netlify Drop).

1. Crée un compte gratuit sur **https://pages.cloudflare.com**
2. *Create a project* → *Direct Upload*
3. Donne un nom au projet (ex. `middlwear`), puis glisse le contenu du dossier.
4. URL finale : `https://middlwear.pages.dev`

---

## Niveau 3 — GitHub Pages (mode statique, si tu veux versionner)

Demande de savoir utiliser `git` en ligne de commande — plus technique que
les deux niveaux précédents, mais donne un historique de versions.

### 1. Prérequis
- Un compte sur **https://github.com** (gratuit)
- Git installé : `git --version` doit répondre.
  Sinon : https://git-scm.com/downloads

### 2. Crée le dépôt sur GitHub
Clique sur **New repository**, nomme-le `middlwear`, laisse-le **Public**,
et **ne coche rien** (pas de README, pas de .gitignore).

### 3. Dans un terminal, place-toi dans le dossier du site
```bash
cd chemin/vers/middlwear
```

### 4. Copie-colle ces commandes
Remplace `TON-PSEUDO` par ton nom d'utilisateur GitHub :

```bash
git init
git add .
git commit -m "Middlwear - site vitrine"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/middlwear.git
git push -u origin main
```

Git te demandera tes identifiants. **Attention** : GitHub n'accepte plus le
mot de passe classique — il faut un *Personal Access Token*.
Génère-le ici : **Settings → Developer settings → Personal access tokens →
Tokens (classic) → Generate new token**, coche la case `repo`, puis copie
le token et colle-le à la place du mot de passe.

### 5. Active GitHub Pages
Sur la page du dépôt : **Settings → Pages → Source : `main` / `(root)` → Save**

Ton site sera en ligne sous 1-2 minutes à l'adresse :
`https://TON-PSEUDO.github.io/middlwear/`

### 6. Pour publier une modification plus tard
```bash
git add .
git commit -m "mise a jour"
git push
```

---

## Points de vigilance (niveaux 1 à 3)

- **`index.html` doit être à la racine** de ce que tu uploades, pas dans un
  sous-dossier. Sinon la page d'accueil ne s'affichera pas.
- **N'oublie pas le dossier `assets/`** : c'est lui qui contient le logo et
  les photos produits.
- `run.sh` et `run.bat` ne servent qu'en local. Tu peux les laisser, ils
  seront simplement ignorés en ligne.
- Après une mise à jour, fais `Ctrl + F5` pour contourner le cache.
- En mode statique, le bouton "Se connecter" reste visible mais inactif
  (pas de backend à contacter) — voir niveaux 4/5 pour l'activer.

## Rappel important
Le tunnel de paiement reste une **maquette**, même en mode complet (comptes
réels) : un bandeau le signale sur l'écran de paiement, et un bouton remplit
automatiquement une carte de test. Aucune carte n'est débitée. Pour de vrais
paiements il faudra brancher CMI / Stripe avec un compte marchand — hors
scope de ce site pour l'instant.

---

## Niveau 4 — Render.com (mode complet : comptes + authentification)

Plus complexe que les niveaux 1 à 3 car il faut faire tourner un vrai
serveur Node.js en continu (pas juste des fichiers statiques). C'est
l'option la plus simple parmi celles qui le permettent gratuitement, sans
carte bancaire.

1. Pousse le dossier `middlwear/` (avec `server/`) sur GitHub — voir
   Niveau 3 plus haut si ce n'est pas déjà fait.
2. Sur **https://render.com** → *New* → *Web Service* → connecte le repo.
3. Réglages :
   - **Root Directory** : `server`
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`
4. Dans *Environment*, ajoute les variables de `server/.env.example`
   (au minimum `JWT_SECRET` avec une vraie valeur aléatoire — voir la
   commande fournie dans ce fichier). Pour les clés Google/Facebook/
   Instagram, mets à jour `BASE_URL` avec l'URL Render (ex.
   `https://middlwear.onrender.com`) et les URI de redirection déclarées
   chez Google/Meta en conséquence.
5. Déploie. Le site (statique + comptes) est servi depuis la même URL.

**Limites à connaître** :
- Sur le plan gratuit, le service **s'endort après une quinzaine de minutes
  sans visite** et met quelques dizaines de secondes à se réveiller à la
  requête suivante — normal, pas un bug.
- Le système de fichiers est effacé à chaque redéploiement ou redémarrage —
  la base SQLite (`server/data/middlwear.sqlite`) repart donc de zéro à ce
  moment-là. Pour une vraie persistance en production, il faudra migrer vers
  une base hébergée (ex. PostgreSQL gratuit sur Render/Supabase) — une
  évolution à prévoir plus tard, pas bloquante pour tester le site avec de
  vrais comptes aujourd'hui.

---

## Niveau 5 — Railway / Fly.io (mode complet, alternatives à Render)

Même principe et même niveau de complexité que Render (connecter le repo
GitHub, pointer vers `server/`, définir les variables d'environnement,
déployer). Classées après Render ici parce que leurs offres gratuites ont
changé plusieurs fois ces dernières années et sont moins prévisibles dans
la durée — **vérifie les conditions actuelles au moment de déployer**
(crédit d'essai limité, carte bancaire parfois demandée en vérification
sans être débitée, etc.) :
- **Railway** — https://railway.app
- **Fly.io** — https://fly.io

Si l'un des deux exige une carte bancaire ou un palier payant au moment où
tu regardes, reste sur Render (niveau 4), qui n'en a pas demandé au moment
de la rédaction de ce guide.
