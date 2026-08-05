/* MIDDLWEAR — catalogue
   Prix en MAD, calés sur un benchmark du marché marocain
   (Jumia.ma / Electroplanet.ma, consulté août 2026).
   `perf` = indice de performance 0-100 (0 = entrée de gamme économique,
   100 = haut de gamme performance). Utilisé par le curseur Économique ⇄ Performance. */

const PRODUCTS = [
  // ───────────── ORDINATEURS ─────────────
  { id:"co-01", name:"NexBook Air 14", brand:"Nexbook", category:"ordinateurs", icon:"laptop",
    price:3499, perf:22, specs:["14\" FHD","8 Go RAM","256 Go SSD"], rating:4.1, added:"2026-03-02" },
  { id:"co-02", name:"Vantix ProBook 15", brand:"Vantix", category:"ordinateurs", icon:"laptop",
    price:7999, oldPrice:8999, perf:58, specs:["15.6\" FHD","Core i5, 16 Go RAM","512 Go SSD"], badge:"Promo", rating:4.5, added:"2026-05-14" },
  { id:"co-03", name:"Halcyon Elite X16", brand:"Halcyon", category:"ordinateurs", icon:"laptop",
    price:16999, perf:96, specs:["16\" QHD 165Hz","Core i7, 32 Go RAM","1 To SSD + RTX"], badge:"Best-seller", rating:4.8, added:"2026-06-20" },
  { id:"co-04", name:"Orbex Slim 13", brand:"Orbex", category:"ordinateurs", icon:"laptop",
    price:5499, perf:40, specs:["13.3\" FHD","8 Go RAM","512 Go SSD"], rating:4.2, added:"2026-02-18" },
  { id:"co-05", name:"Kaira Tower Home", brand:"Kaira", category:"ordinateurs", icon:"desktop",
    price:6499, perf:52, specs:["Tour compacte","16 Go RAM","512 Go SSD"], rating:4.3, added:"2026-04-09" },
  { id:"co-06", name:"Solen Compact Mini", brand:"Solen", category:"ordinateurs", icon:"desktop",
    price:4299, perf:30, specs:["Format mini-PC","8 Go RAM","256 Go SSD"], rating:3.9, added:"2026-01-25" },
  { id:"co-07", name:"Nyra Tab 11", brand:"Nyra", category:"ordinateurs", icon:"tablet",
    price:3999, perf:34, specs:["11\" FHD+","Stylet inclus","128 Go"], badge:"Nouveau", rating:4.4, added:"2026-07-11" },
  { id:"co-08", name:"Orbex Pad Lite", brand:"Orbex", category:"ordinateurs", icon:"tablet",
    price:2499, perf:16, specs:["10.1\" HD","4 Go RAM","64 Go"], rating:3.8, added:"2025-12-14" },

  // ───────────── CONNECTÉ ─────────────
  { id:"cn-01", name:"Halcyon Pulse Watch 5", brand:"Halcyon", category:"connecte", icon:"watch",
    price:1299, perf:78, specs:["AMOLED 1.9\"","ECG + SpO2","Autonomie 6 jours"], badge:"Best-seller", rating:4.7, added:"2026-06-05" },
  { id:"cn-02", name:"Vantix Chrono Lite", brand:"Vantix", category:"connecte", icon:"watch",
    price:599, perf:38, specs:["Écran couleur","GPS intégré","Autonomie 10 jours"], rating:4.0, added:"2026-03-19" },
  { id:"cn-03", name:"Kaira Timepiece Steel", brand:"Kaira", category:"connecte", icon:"watch",
    price:1899, oldPrice:2199, perf:86, specs:["Boîtier acier","Saphir anti-rayures","Paiement NFC"], badge:"Promo", rating:4.6, added:"2026-05-01" },
  { id:"cn-04", name:"Solen Fit Band 3", brand:"Solen", category:"connecte", icon:"band",
    price:279, perf:18, specs:["Suivi sommeil","Étanche 5 ATM","Autonomie 14 jours"], rating:4.0, added:"2026-02-22" },
  { id:"cn-05", name:"Nyra Active Band", brand:"Nyra", category:"connecte", icon:"band",
    price:349, perf:26, specs:["Coach IA","SpO2","Autonomie 12 jours"], badge:"Nouveau", rating:4.3, added:"2026-07-02" },
  { id:"cn-06", name:"Orbex Loop Ring", brand:"Orbex", category:"connecte", icon:"ring",
    price:1199, perf:70, specs:["Titane","Suivi récupération","Autonomie 7 jours"], rating:4.4, added:"2026-06-12" },
  { id:"cn-07", name:"Halcyon Aura Ring", brand:"Halcyon", category:"connecte", icon:"ring",
    price:1499, perf:82, specs:["Céramique","Température corporelle","Autonomie 8 jours"], badge:"Nouveau", rating:4.6, added:"2026-07-20" },
  { id:"cn-08", name:"Kaira Vision Frame", brand:"Kaira", category:"connecte", icon:"glasses",
    price:1799, perf:74, specs:["Audio open-ear","Anti-lumière bleue","Autonomie 5h"], rating:4.1, added:"2026-04-27" },
  { id:"cn-09", name:"Driftline Sight Glasses", brand:"Driftline", category:"connecte", icon:"glasses",
    price:1299, perf:56, specs:["Léger 38g","Appels mains-libres","Autonomie 4h"], rating:3.9, added:"2026-01-30" },
  { id:"cn-10", name:"Vantix Focus AR", brand:"Vantix", category:"connecte", icon:"glasses",
    price:2999, perf:94, specs:["Affichage AR intégré","Notifications","Autonomie 3h"], badge:"Best-seller", rating:4.5, added:"2026-06-28" },

  // ───────────── GADGETS ─────────────
  { id:"ga-01", name:"Solen Air Buds Pro", brand:"Solen", category:"gadgets", icon:"earbuds",
    price:649, perf:66, specs:["Réduction de bruit active","Étanche IPX4","24h autonomie"], badge:"Promo", oldPrice:799, rating:4.6, added:"2026-05-16" },
  { id:"ga-02", name:"Kaira Sound Pods", brand:"Kaira", category:"gadgets", icon:"earbuds",
    price:249, perf:24, specs:["Bluetooth 5.3","Boîtier de charge","18h autonomie"], rating:4.0, added:"2026-01-09" },
  { id:"ga-03", name:"Nyra Clarity Buds", brand:"Nyra", category:"gadgets", icon:"earbuds",
    price:399, perf:44, specs:["Son spatial","Transparence adaptative","20h autonomie"], rating:4.3, added:"2026-04-03" },
  { id:"ga-04", name:"Vantix Orb Speaker", brand:"Vantix", category:"gadgets", icon:"speaker",
    price:549, perf:50, specs:["360° audio","Étanche IP67","12h autonomie"], rating:4.4, added:"2026-03-20" },
  { id:"ga-05", name:"Driftline Boom Mini", brand:"Driftline", category:"gadgets", icon:"speaker",
    price:299, perf:20, specs:["Compact & léger","Bluetooth 5.2","8h autonomie"], rating:3.9, added:"2025-12-22" },
  { id:"ga-06", name:"Halcyon Skyline Drone", brand:"Halcyon", category:"gadgets", icon:"drone",
    price:3499, perf:92, specs:["Caméra 4K stabilisée","35 min de vol","Évitement d'obstacles"], badge:"Best-seller", rating:4.8, added:"2026-06-09" },
  { id:"ga-07", name:"Orbex Scout Drone Mini", brand:"Orbex", category:"gadgets", icon:"drone",
    price:1399, perf:60, specs:["Caméra Full HD","Pliable","20 min de vol"], rating:4.1, added:"2026-02-15" },
  { id:"ga-08", name:"Kaira Vision VR One", brand:"Kaira", category:"gadgets", icon:"vr",
    price:2799, perf:88, specs:["Écran 4K par œil","Suivi des mains","Sans fil"], badge:"Nouveau", rating:4.5, added:"2026-07-03" },

  // ───────────── MOBILITÉ ─────────────
  { id:"mo-01", name:"Orbex CityHop Mini", brand:"Orbex", category:"mobilite", icon:"scooter",
    price:2399, perf:28, specs:["Pliable 12 kg","Autonomie 20 km","Vitesse max 20 km/h"], rating:4.0, added:"2026-02-08" },
  { id:"mo-02", name:"Driftline Urban Ride", brand:"Driftline", category:"mobilite", icon:"scooter",
    price:2999, perf:54, specs:["Moteur 350W","Autonomie 25 km","Vitesse max 25 km/h"], badge:"Best-seller", rating:4.5, added:"2026-05-22" },
  { id:"mo-03", name:"Vantix SwiftScoot Pro", brand:"Vantix", category:"mobilite", icon:"scooter",
    price:4999, oldPrice:5699, perf:80, specs:["Moteur 500W","Autonomie 45 km","Double suspension"], badge:"Promo", rating:4.6, added:"2026-06-15" },
  { id:"mo-04", name:"Halcyon TrailMax", brand:"Halcyon", category:"mobilite", icon:"scooter",
    price:7999, perf:98, specs:["Tout-terrain","Autonomie 55 km","Pneus 10\" tubeless"], badge:"Nouveau", rating:4.7, added:"2026-07-18" }
];
