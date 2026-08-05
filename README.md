# Middlwear — boutique tech (démo)

## ⚠️ Si tu vois l'ancien site en lançant run.bat
C'est le **cache du navigateur**. Deux solutions :
- `Ctrl + F5` (ou `Ctrl + Shift + R`) une fois la page ouverte
- ou ouvre en navigation privée

Vérifie aussi que tu lances bien le `run.bat` **de ce dossier-ci**, et
qu'aucun ancien serveur ne tourne déjà sur le port 8000.

## Lancer
- **Windows** : double-clic sur `run.bat`
- **Mac / Linux** : double-clic sur `run.sh` (ou `./run.sh`)
- **Sans serveur** : ouvre `index.html` directement

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
│   └── app.js       filtres, panier, checkout
├── assets/          logo (monogramme + version complète)
├── run.sh / run.bat
└── README.md
```

## Paiement
Tunnel entièrement **simulé** (validation Luhn, format de date, confirmation).
Aucune carte n'est débitée, aucune donnée ne quitte le navigateur. Pour de
vrais paiements il faudra brancher CMI / Stripe avec ton propre compte marchand.
