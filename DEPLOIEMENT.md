# Mettre Middlwear en ligne (gratuitement)

Le site est 100% statique : pas de serveur, pas de base de données.
Tout hébergeur gratuit fera l'affaire.

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
Le tunnel de paiement est une **maquette**. Un bandeau le signale en haut du
site et sur l'écran de paiement, et un bouton remplit automatiquement une
carte de test. Aucune donnée n'est envoyée nulle part — mais préviens quand
même tes amis de ne jamais saisir de vraie carte sur une démo.
