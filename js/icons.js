/* MIDDLWEAR — icônes SVG en ligne, style duotone (teal / violet) */

const ICONS = {
  search: `<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="M20 20L16 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  all: `<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" stroke="currentColor" stroke-width="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" stroke="currentColor" stroke-width="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" stroke="currentColor" stroke-width="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" stroke="currentColor" stroke-width="1.6"/></svg>`,
  computers: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4.5" width="18" height="11.5" rx="1.6" stroke="currentColor" stroke-width="1.6"/><path d="M9 19.5h6M12 16v3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  connecte: `<svg viewBox="0 0 24 24" fill="none"><rect x="7.5" y="6" width="9" height="12" rx="2.6" stroke="currentColor" stroke-width="1.6"/><path d="M9.5 6V4M14.5 6V4M9.5 20v-2M14.5 20v-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  gadgets: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.4" stroke="currentColor" stroke-width="1.6"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  mobilite: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 19h3l2.5-9H16l1 3h2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.5" cy="19" r="1.6" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="19" r="1.6" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 10h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  empty: `<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="M20 20L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8.5 11h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 4h2l2.4 12.2a2 2 0 002 1.8h7.6a2 2 0 002-1.8L20 8H6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="21" r="1.4" fill="currentColor"/><circle cx="17" cy="21" r="1.4" fill="currentColor"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 7h14M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-9 0l1 12a1.5 1.5 0 001.5 1.4h5a1.5 1.5 0 001.5-1.4l1-12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="7.5" cy="18" r="1.6" stroke="currentColor" stroke-width="1.5"/><circle cx="17.5" cy="18" r="1.6" stroke="currentColor" stroke-width="1.5"/></svg>`,
  card: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 9.5h18" stroke="currentColor" stroke-width="1.6"/><path d="M6.5 14.5h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M8 10.5V8a4 4 0 018 0v2.5" stroke="currentColor" stroke-width="1.6"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4.5 4.5L19 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="1.6"/><path d="M8 12.5l2.7 2.7L16.5 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l6-6M5 12l6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.6 7-11.5A7 7 0 105 9.5C5 14.4 12 21 12 21z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.4" stroke="currentColor" stroke-width="1.5"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.6" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 20c1.3-4 4-5.8 7.5-5.8s6.2 1.8 7.5 5.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,

};

/* Icônes produits (illustrations dans les cartes) */
const PRODUCT_ICONS = {
  laptop: `<svg viewBox="0 0 72 72" fill="none">
    <rect x="14" y="14" width="44" height="30" rx="2.5" stroke="url(#pg)" stroke-width="2"/>
    <path d="M8 50h56l-4 6H12l-4-6z" stroke="url(#pg)" stroke-width="2" stroke-linejoin="round"/>
    <path d="M20 22h32M20 28h24M20 34h20" stroke="#8b7cff" stroke-width="1.3" stroke-linecap="round" opacity="0.55"/>
    <defs><linearGradient id="pg" x1="8" y1="14" x2="58" y2="56" gradientUnits="userSpaceOnUse"><stop stop-color="#22f0c4"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
  </svg>`,

  desktop: `<svg viewBox="0 0 72 72" fill="none">
    <rect x="16" y="12" width="40" height="27" rx="2.5" stroke="url(#pg2)" stroke-width="2"/>
    <path d="M30 46v8M42 46v8M24 54h24" stroke="url(#pg2)" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 20h28M22 26h20M22 32h24" stroke="#8b7cff" stroke-width="1.3" stroke-linecap="round" opacity="0.55"/>
    <defs><linearGradient id="pg2" x1="16" y1="12" x2="56" y2="54" gradientUnits="userSpaceOnUse"><stop stop-color="#22f0c4"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
  </svg>`,

  tablet: `<svg viewBox="0 0 72 72" fill="none">
    <rect x="21" y="10" width="30" height="52" rx="4" stroke="url(#pg3)" stroke-width="2"/>
    <circle cx="36" cy="55" r="1.8" fill="#22f0c4"/>
    <path d="M27 20h18M27 26h14" stroke="#8b7cff" stroke-width="1.3" stroke-linecap="round" opacity="0.55"/>
    <defs><linearGradient id="pg3" x1="21" y1="10" x2="51" y2="62" gradientUnits="userSpaceOnUse"><stop stop-color="#22f0c4"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
  </svg>`,

  watch: `<svg viewBox="0 0 72 72" fill="none">
    <path d="M28 14h16l1.6 10H26.4L28 14zM28 58h16l1.6-10H26.4L28 58z" stroke="url(#pg4)" stroke-width="2" stroke-linejoin="round"/>
    <rect x="23" y="24" width="26" height="24" rx="6" stroke="url(#pg4)" stroke-width="2"/>
    <path d="M36 32v6l4 3" stroke="#22f0c4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <defs><linearGradient id="pg4" x1="23" y1="14" x2="49" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#22f0c4"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
  </svg>`,

  band: `<svg viewBox="0 0 72 72" fill="none">
    <path d="M12 36c0-9 6-15 12-15h24c6 0 12 6 12 15s-6 15-12 15H24c-6 0-12-6-12-15z" stroke="url(#pg5)" stroke-width="2"/>
    <rect x="27" y="27" width="18" height="18" rx="4" stroke="#22f0c4" stroke-width="1.8"/>
    <defs><linearGradient id="pg5" x1="12" y1="21" x2="60" y2="51" gradientUnits="userSpaceOnUse"><stop stop-color="#22f0c4"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
  </svg>`,

  ring: `<svg viewBox="0 0 72 72" fill="none">
    <circle cx="36" cy="38" r="16" stroke="url(#pg6)" stroke-width="4.5"/>
    <path d="M28 22l4-8h8l4 8" stroke="#22f0c4" stroke-width="2" stroke-linejoin="round"/>
    <defs><linearGradient id="pg6" x1="20" y1="22" x2="52" y2="54" gradientUnits="userSpaceOnUse"><stop stop-color="#22f0c4"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
  </svg>`,

  glasses: `<svg viewBox="0 0 72 72" fill="none">
    <circle cx="21" cy="38" r="11" stroke="url(#pg11)" stroke-width="2.2"/>
    <circle cx="51" cy="38" r="11" stroke="url(#pg11)" stroke-width="2.2"/>
    <path d="M32 36h8M10 34l-4-2M62 34l4-2" stroke="url(#pg11)" stroke-width="2.2" stroke-linecap="round"/>
    <defs><linearGradient id="pg11" x1="10" y1="27" x2="62" y2="49" gradientUnits="userSpaceOnUse"><stop stop-color="#22f0c4"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
  </svg>`,

  earbuds: `<svg viewBox="0 0 72 72" fill="none">
    <path d="M24 26c0-5 3-9 8-9s8 4 8 9v6c0 4-3 7-7 7" stroke="url(#pg7)" stroke-width="2" stroke-linecap="round"/>
    <path d="M40 26c0-5 3-9 8-9s8 4 8 9v6c0 4-3 7-7 7" stroke="url(#pg7)" stroke-width="2" stroke-linecap="round"/>
    <rect x="19" y="38" width="9" height="14" rx="4" stroke="#22f0c4" stroke-width="1.8"/>
    <rect x="44" y="38" width="9" height="14" rx="4" stroke="#22f0c4" stroke-width="1.8"/>
    <defs><linearGradient id="pg7" x1="24" y1="17" x2="48" y2="39" gradientUnits="userSpaceOnUse"><stop stop-color="#22f0c4"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
  </svg>`,

  speaker: `<svg viewBox="0 0 72 72" fill="none">
    <rect x="20" y="10" width="32" height="52" rx="10" stroke="url(#pg8)" stroke-width="2"/>
    <circle cx="36" cy="28" r="6.5" stroke="#22f0c4" stroke-width="1.8"/>
    <circle cx="36" cy="48" r="9.5" stroke="#8b7cff" stroke-width="1.8"/>
    <defs><linearGradient id="pg8" x1="20" y1="10" x2="52" y2="62" gradientUnits="userSpaceOnUse"><stop stop-color="#22f0c4"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
  </svg>`,

  drone: `<svg viewBox="0 0 72 72" fill="none">
    <rect x="29" y="30" width="14" height="10" rx="3" stroke="url(#pg9)" stroke-width="2"/>
    <path d="M29 33L15 22M43 33l14-11M29 37L15 48M43 37l14 11" stroke="url(#pg9)" stroke-width="2" stroke-linecap="round"/>
    <circle cx="15" cy="22" r="6" stroke="#22f0c4" stroke-width="1.8"/>
    <circle cx="57" cy="22" r="6" stroke="#22f0c4" stroke-width="1.8"/>
    <circle cx="15" cy="48" r="6" stroke="#8b7cff" stroke-width="1.8"/>
    <circle cx="57" cy="48" r="6" stroke="#8b7cff" stroke-width="1.8"/>
    <defs><linearGradient id="pg9" x1="15" y1="22" x2="57" y2="48" gradientUnits="userSpaceOnUse"><stop stop-color="#22f0c4"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
  </svg>`,

  vr: `<svg viewBox="0 0 72 72" fill="none">
    <path d="M14 26c0-4 3-6 7-6h30c4 0 7 2 7 6v14c0 5-4 9-9 9-4 0-6-2-8-6l-1.5-3a5 5 0 00-8.5-1l-.5.9c-2 3-4 6-9 9-1 0-9-4-9-13V26z" stroke="url(#pg10)" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="25" cy="30" r="3.4" fill="#22f0c4"/>
    <circle cx="47" cy="30" r="3.4" fill="#8b7cff"/>
    <defs><linearGradient id="pg10" x1="14" y1="20" x2="58" y2="49" gradientUnits="userSpaceOnUse"><stop stop-color="#22f0c4"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
  </svg>`,

  scooter: `<svg viewBox="0 0 72 72" fill="none">
    <path d="M18 58h9l7-28h6" stroke="url(#pg12)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M40 30h12l4 10h9" stroke="url(#pg12)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="22" cy="58" r="5" stroke="#22f0c4" stroke-width="2"/>
    <circle cx="58" cy="58" r="5" stroke="#22f0c4" stroke-width="2"/>
    <path d="M40 30V16M34 16h12" stroke="#8b7cff" stroke-width="2.2" stroke-linecap="round"/>
    <defs><linearGradient id="pg12" x1="18" y1="16" x2="63" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#22f0c4"/><stop offset="1" stop-color="#8b7cff"/></linearGradient></defs>
  </svg>`
};

/* Icônes supplémentaires — UI v2 */
ICONS.sparkle = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
ICONS.wallet = `<svg viewBox="0 0 24 24" fill="none"><path d="M3 8a2 2 0 012-2h12a2 2 0 012 2v1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><rect x="3" y="8" width="18" height="11" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="16.5" cy="13.5" r="1.3" fill="currentColor"/></svg>`;
ICONS.bolt = `<svg viewBox="0 0 24 24" fill="none"><path d="M13 3L5.5 13H11l-1 8 8-10.5H12.5L13 3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
ICONS.star = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 4l2.3 4.9 5.2.7-3.8 3.7.9 5.3L12 16.1 7.4 18.6l.9-5.3L4.5 9.6l5.2-.7L12 4z" fill="currentColor"/></svg>`;
ICONS.globe = `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.4 3.3 8.5s-1.1 6.1-3.3 8.5c-2.2-2.4-3.3-5.4-3.3-8.5S9.8 5.9 12 3.5z" stroke="currentColor" stroke-width="1.4"/></svg>`;
ICONS.shield = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 12.5l2.2 2.2L15.5 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
ICONS.warn = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5l8.5 15h-17l8.5-15z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="12" cy="16.8" r="1" fill="currentColor"/></svg>`;
