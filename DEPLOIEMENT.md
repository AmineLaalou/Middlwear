# Mettre Middlwear en ligne (gratuitement)

Deux modes possibles, voir `README.md` pour le détail :

- **Mode statique** (options A/B/C ci-dessous) : pas de serveur, pas de
  compte utilisateur. C'est ce que ce guide couvre en premier.
- **Mode complet** (comptes, authentification, connexion sociale) :
  nécessite un hébergeur qui fait tourner du Node.js — voir la section
  "Mettre en ligne le mode complet" tout en bas.

---

## Option A — Netlify Drop (le plus rapide, ~1 minute)

1. Décompresse le zip. Tu dois avoir un dossier `middlwear/` contenant
   `index.html`, `css/`, `js/`, `assets/`.
2. Va sur **https://app.netlify.com/drop**
3. Glisse-dépose le **dossier `middlwear`** (pas le .zip) dans la zone.
4. C'est en ligne. Tu obtiens une URL type `https://joyful-tesla-a1b2c3.netlify.app`

Le lien est temporaire tant que tu ne crées pas de compte. Crée un compte
gratuit (bouton proposé juste après) pour le garder et renommer le
sous-domaine en `middlwear.netlify.app` si c'est libre.

---

## Option B — Cloudflare Pages (meilleure vitesse depuis le Maroc)

1. Crée un compte gratuit sur **https://pages.cloudflare.com**
2. *Create a project* → *Direct Upload*
3. Donne un nom au projet (ex. `middlwear`), puis glisse le contenu du dossier.
4. URL finale : `https://middlwear.pages.dev`

---

## Option C — GitHub Pages (si tu veux versionner)

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

## Points de vigilance

- **`index.html` doit être à la racine** de ce que tu uploades, pas dans un
  sous-dossier. Sinon la page d'accueil ne s'affichera pas.
- **N'oublie pas le dossier `assets/`** : c'est lui qui contient le logo.
- `run.sh` et `run.bat` ne servent qu'en local. Tu peux les laisser, ils
  seront simplement ignorés en ligne.
- Après une mise à jour, fais `Ctrl + F5` pour contourner le cache.

## Rappel important
Le tunnel de paiement reste une **maquette**, même en mode complet (comptes
réels) : un bandeau le signale sur l'écran de paiement, et un bouton remplit
automatiquement une carte de test. Aucune carte n'est débitée. Pour de vrais
paiements il faudra brancher CMI / Stripe avec un compte marchand — hors
scope de ce site pour l'instant.

---

## Mettre en ligne le mode complet (comptes + authentification)

Contrairement au mode statique, ceci nécessite un hébergeur qui exécute du
**Node.js** en continu (Netlify Drop / GitHub Pages ne suffisent plus).

### Option recommandée — Render.com (gratuit)
1. Pousse le dossier `middlwear/` (avec `server/`) sur GitHub — voir Option C
   plus haut si ce n'est pas déjà fait.
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

**Limite à connaître** : sur le plan gratuit de Render (comme la plupart des
hébergeurs gratuits), le système de fichiers est effacé à chaque redéploiement
ou redémarrage — la base SQLite (`server/data/middlwear.sqlite`) repart donc
de zéro à ce moment-là. Pour une vraie persistance en production, il faudra
migrer vers une base hébergée (ex. PostgreSQL gratuit sur Render/Railway/
Supabase) — une évolution à prévoir plus tard, pas bloquante pour tester le
site avec de vrais comptes aujourd'hui.

### Alternatives équivalentes
**Railway** (railway.app) et **Fly.io** (fly.io) fonctionnent sur le même
principe : connecter le repo GitHub, pointer vers `server/`, définir les
variables d'environnement, déployer. Les trois ont un palier gratuit.
