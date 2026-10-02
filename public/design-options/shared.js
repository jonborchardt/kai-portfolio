// Shared by the design mockups: made-up pieces, generated stand-in artwork, a
// tiny hash router, the filter buttons and the option switcher.
// Throwaway: nothing here ships with the site.

const OPTIONS = [
  ["1-gallery-wall.html", "Gallery Wall"],
  ["2-darkroom.html", "Darkroom"],
  ["3-zine.html", "Zine"],
  ["4-index.html", "Index"],
  ["5-studio.html", "Studio"],
];

const TYPES = ["art", "photo", "video", "music"];
const LABEL = { art: "Art", photo: "Photo", video: "Video", music: "Music" };
const PLURAL = { art: "Artwork", photo: "Photos", video: "Videos", music: "Music" };
const BLURB =
  "Placeholder text. Kai's own words about the piece go here: what it is, how it was made, and why.";
const BIO = [
  "Placeholder bio. A few sentences in Kai's own words go here: where home is, what gets made, and what is on the desk right now.",
  "A second paragraph could cover shows, classes, favorite tools, or how to get in touch about a piece.",
];
const CONTACT = ["Email", "Instagram", "YouTube"];

const ICON = {
  sun: `<svg class="i-sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
  moon: `<svg class="i-moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  video: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>`,
  music: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M9 3v11.2A3.5 3.5 0 1 0 11 17.5V7h7V3z"/></svg>`,
};

/** The play or music-note mark that sits on a video or music thumbnail. */
const badge = (p) => (ICON[p.type] ? `<span class="badge">${ICON[p.type]}</span>` : "");

// Newest first.
const TITLES = [
  ["Koi Pond", "art"],
  ["Bus Stop, 6 a.m.", "photo"],
  ["Paper Boats", "video"],
  ["Orange Peel Study", "art"],
  ["Low Tide", "photo"],
  ["Night Swim", "music"],
  ["The Long Hallway", "art"],
  ["Grandma's Garden", "photo"],
  ["Static", "art"],
  ["Rooftop Cats", "photo"],
  ["Slow Dance for Robots", "music"],
  ["Self-Portrait with Headphones", "art"],
  ["Fog on Route 9", "photo"],
  ["Marble Run", "video"],
  ["Three Lemons", "art"],
  ["Skate Park at Dusk", "photo"],
  ["Tangle", "art"],
  ["Lullaby in D", "music"],
  ["Window Seat", "photo"],
  ["The Blue Chair", "art"],
  ["Mountain, Remembered", "art"],
  ["Laundry Day", "photo"],
  ["Moth", "video"],
  ["Field Notes", "art"],
  ["Puddle Sky", "photo"],
  ["Cassette Summer", "music"],
  ["Paper Cranes", "art"],
  ["Ferris Wheel", "photo"],
  ["City Grid", "art"],
  ["One Minute of Rain", "video"],
  ["Sunflower, Late", "art"],
  ["Pier", "photo"],
  ["Small Hours", "music"],
  ["Mask", "art"],
  ["Dog Walkers", "photo"],
  ["Seaweed", "art"],
  ["Clay Day", "video"],
  ["Tide Pool", "art"],
  ["Snow on the Bike", "photo"],
  ["Waltz for a Goldfish", "music"],
  ["Kitchen Table", "art"],
  ["Echo", "video"],
  ["Greenhouse", "photo"],
  ["Comet", "art"],
  ["First Loop", "music"],
  ["Birds on a Wire", "art"],
  ["Tunnel", "video"],
  ["Yellow Door", "art"],
];

const MEDIUMS = {
  art: ["Watercolor on paper", "Acrylic on canvas", "Ink on paper", "Gouache", "Oil pastel", "Linocut print", "Digital"],
  photo: ["35mm film", "Digital photograph", "Instant film"],
  video: ["Short film", "Stop-motion", "Music video"],
  music: ["Piano", "Guitar and voice", "Synth", "Lo-fi beat"],
};
const SIZES = {
  art: [[400, 500], [400, 560], [500, 400], [480, 480], [400, 600]],
  photo: [[600, 400], [600, 400], [400, 600], [600, 450]],
  video: [[640, 360]],
  music: [[500, 500]],
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PALETTES = [
  ["#f4d35e", "#ee964b", "#f95738", "#0d3b66", "#faf0ca"],
  ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"],
  ["#3d348b", "#7678ed", "#f7b801", "#f18701", "#f35b04"],
  ["#606c38", "#283618", "#fefae0", "#dda15e", "#bc6c25"],
  ["#ffcdb2", "#ffb4a2", "#e5989b", "#b5838d", "#6d6875"],
  ["#001219", "#005f73", "#0a9396", "#94d2bd", "#ee9b00"],
  ["#cdb4db", "#ffc8dd", "#ffafcc", "#bde0fe", "#a2d2ff"],
  ["#10002b", "#5a189a", "#9d4edd", "#e0aaff", "#ff6d00"],
];
// [sky top, sky bottom, sun, far hills, near hills]
const SKIES = [
  ["#2b1055", "#ff8e53", "#ffe29a", "#7b3f61", "#1d1128"],
  ["#4aa3df", "#cfe9f7", "#fffbe6", "#5b8c5a", "#23432b"],
  ["#f6d365", "#fda085", "#ffffff", "#c9703f", "#5b2a1c"],
  ["#b8c6db", "#f5f7fa", "#ffffff", "#8fa3b5", "#4b5d6b"],
  ["#ff9a9e", "#fad0c4", "#fff6e0", "#a8577e", "#3d2244"],
];
const NIGHTS = [
  ["#0b0b1e", "#3a1c71", "#ffd6a5", "#241a3c", "#0a0814"],
  ["#020c1b", "#0a3d62", "#e8f1f2", "#06283d", "#01101c"],
  ["#1a0b0b", "#b23a48", "#fcb9b2", "#461220", "#160606"],
];

/** A repeatable random number generator, so every option shows the same art. */
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (r, list) => list[Math.floor(r() * list.length)];
const n = Math.round;

function svg(w, h, body, defs = "") {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${defs}</defs>${body}</svg>`,
  )}`;
}

/** Soft blobs of color with a few brush strokes over them. */
function wash(r, w, h) {
  const p = pick(r, PALETTES);
  let defs = "";
  let body = `<rect width="${w}" height="${h}" fill="${p[4]}"/>`;
  for (let i = 0; i < 7; i++) {
    const c = p[i % 4];
    defs += `<radialGradient id="g${i}"><stop stop-color="${c}" stop-opacity=".95"/><stop offset=".6" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
    body += `<circle cx="${n(r() * w)}" cy="${n(r() * h)}" r="${n((0.2 + r() * 0.35) * Math.max(w, h))}" fill="url(#g${i})"/>`;
  }
  for (let i = 0; i < 4; i++) {
    body += `<path d="M${n(r() * w)} ${n(r() * h)}Q${n(r() * w)} ${n(r() * h)} ${n(r() * w)} ${n(r() * h)}" fill="none" stroke="${pick(r, p)}" stroke-width="${n(6 + r() * 26)}" stroke-linecap="round" opacity=".75"/>`;
  }
  return svg(w, h, body, defs);
}

/** Flat paper cut-out shapes. */
function cutouts(r, w, h) {
  const p = pick(r, PALETTES);
  let body = `<rect width="${w}" height="${h}" fill="${p[4]}"/>`;
  for (let i = 0; i < 9; i++) {
    const x = n(r() * w);
    const y = n(r() * h);
    const s = n((0.1 + r() * 0.25) * w);
    const c = p[Math.floor(r() * 4)];
    const turn = `transform="rotate(${n(r() * 360)} ${x} ${y})"`;
    const kind = Math.floor(r() * 4);
    body +=
      kind === 0
        ? `<circle cx="${x}" cy="${y}" r="${s}" fill="${c}"/>`
        : kind === 1
          ? `<rect x="${x - s}" y="${y - s / 2}" width="${s * 2}" height="${s}" fill="${c}" ${turn}/>`
          : kind === 2
            ? `<path d="M${x - s} ${y}A${s} ${s} 0 0 1 ${x + s} ${y}Z" fill="${c}" ${turn}/>`
            : `<polygon points="${x},${y - s} ${x + s},${y + s} ${x - s},${y + s}" fill="${c}" ${turn}/>`;
  }
  return svg(w, h, body);
}

/** Ink ridge lines on paper with one spot of color. */
function ridges(r, w, h) {
  const paper = "#f3ede0";
  const cx = w * (0.3 + r() * 0.4);
  const spread = w * (0.12 + r() * 0.12);
  let body = `<rect width="${w}" height="${h}" fill="${paper}"/><circle cx="${n(w * (0.2 + r() * 0.6))}" cy="${n(h * 0.24)}" r="${n(w * 0.13)}" fill="${pick(r, PALETTES)[Math.floor(r() * 4)]}"/>`;
  const rows = 16;
  for (let i = 0; i < rows; i++) {
    const y0 = h * (0.34 + (0.58 * i) / rows);
    let d = `M0 ${n(y0)}`;
    for (let x = 0; x <= w; x += w / 40) {
      const bump = Math.exp(-(((x - cx) / spread) ** 2));
      d += `L${n(x)} ${n(y0 - bump * h * 0.16 * (0.4 + r()))}`;
    }
    body += `<path d="${d}" fill="${paper}" stroke="#1d1b19" stroke-width="2" stroke-linejoin="round"/>`;
  }
  return svg(w, h, body);
}

function hill(r, w, h, base, amp, fill, opacity = 1) {
  const p1 = r() * 6;
  const p2 = r() * 6;
  const f1 = 1 + r() * 2;
  const f2 = 3 + r() * 3;
  let d = `M0 ${h}`;
  for (let x = 0; x <= w; x += w / 24) {
    const t = (x / w) * Math.PI;
    d += `L${n(x)} ${n(h * base + Math.sin(t * f1 + p1) * h * amp + Math.sin(t * f2 + p2) * h * amp * 0.35)}`;
  }
  return `<path d="${d}L${w} ${h}Z" fill="${fill}" opacity="${opacity}"/>`;
}

/** Sky, sun and three rows of hills: stands in for photos and video stills. */
function landscape(r, w, h, skies) {
  const [top, bottom, sun, far, near] = pick(r, skies);
  const sx = n(w * (0.2 + r() * 0.6));
  const sy = n(h * (0.25 + r() * 0.25));
  const defs = `<linearGradient id="s" x2="0" y2="1"><stop stop-color="${top}"/><stop offset=".75" stop-color="${bottom}"/></linearGradient><radialGradient id="h"><stop stop-color="${sun}" stop-opacity=".7"/><stop offset="1" stop-color="${sun}" stop-opacity="0"/></radialGradient>`;
  let body = `<rect width="${w}" height="${h}" fill="url(#s)"/>`;
  if (skies === NIGHTS) {
    for (let i = 0; i < 40; i++) {
      body += `<circle cx="${n(r() * w)}" cy="${n(r() * h * 0.6)}" r="${(0.6 + r()).toFixed(1)}" fill="#fff" opacity="${(0.3 + r() * 0.7).toFixed(2)}"/>`;
    }
  }
  body += `<circle cx="${sx}" cy="${sy}" r="${n(h * 0.4)}" fill="url(#h)"/><circle cx="${sx}" cy="${sy}" r="${n(h * 0.07)}" fill="${sun}"/>`;
  body += hill(r, w, h, 0.62, 0.08, far, 0.55) + hill(r, w, h, 0.73, 0.07, far) + hill(r, w, h, 0.85, 0.06, near);
  return svg(w, h, body, defs);
}

/** Out-of-focus lights at night. */
function bokeh(r, w, h) {
  const p = pick(r, PALETTES);
  let body = `<rect width="${w}" height="${h}" fill="#0d0b14"/>`;
  for (let i = 0; i < 28; i++) {
    body += `<circle cx="${n(r() * w)}" cy="${n(r() * h)}" r="${n((0.03 + r() * 0.09) * w)}" fill="${pick(r, p)}" opacity="${(0.15 + r() * 0.45).toFixed(2)}"/>`;
  }
  return svg(w, h, body);
}

/** A square record cover: rings or a waveform. */
function cover(r, w) {
  const p = pick(r, PALETTES);
  let body = `<rect width="${w}" height="${w}" fill="${p[0]}"/>`;
  if (r() < 0.5) {
    const cx = n(w * (0.35 + r() * 0.3));
    const cy = n(w * (0.35 + r() * 0.3));
    for (let i = 8; i > 0; i--) {
      body += `<circle cx="${cx}" cy="${cy}" r="${n((i * w) / 11)}" fill="${p[1 + (i % 4)]}"/>`;
    }
  } else {
    for (let i = 0; i < 28; i++) {
      const tall = w * (0.08 + r() * 0.6);
      body += `<rect x="${n(w * 0.08 + i * w * 0.03)}" y="${n((w - tall) / 2)}" width="${n(w * 0.018)}" height="${n(tall)}" rx="${n(w * 0.009)}" fill="${p[1 + (i % 4)]}"/>`;
    }
  }
  return svg(w, w, body);
}

/** Stand-in for a photo of Kai: a plain head-and-shoulders shape. */
function face(bg, fg) {
  return svg(
    400,
    400,
    `<rect width="400" height="400" fill="${bg}"/><circle cx="200" cy="165" r="78" fill="${fg}"/><path d="M60 400c0-95 62-150 140-150s140 55 140 150z" fill="${fg}"/>`,
  );
}

function artwork(r, type, w, h) {
  const k = r();
  if (type === "music") return cover(r, w);
  if (type === "video") return landscape(r, w, h, NIGHTS);
  if (type === "photo") return k < 0.75 ? landscape(r, w, h, SKIES) : bokeh(r, w, h);
  return k < 0.4 ? wash(r, w, h) : k < 0.75 ? cutouts(r, w, h) : ridges(r, w, h);
}

const PIECES = TITLES.map(([title, type], i) => {
  const r = rng(i * 7919 + 11);
  const [w, h] = pick(r, SIZES[type]);
  const month = 2026 * 12 + 8 - Math.floor(i * 0.8);
  return {
    n: String(TITLES.length - i).padStart(3, "0"),
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    title,
    type,
    medium: pick(r, MEDIUMS[type]),
    date: `${MONTHS[month % 12]} ${Math.floor(month / 12)}`,
    year: Math.floor(month / 12),
    w,
    h,
    src: artwork(r, type, w, h),
  };
});

/** The pieces either side of this one: `prev` is newer, `next` is older. */
function near(p) {
  const i = PIECES.indexOf(p);
  return { prev: PIECES[i - 1], next: PIECES[i + 1] };
}

/** Fills `el` with the All / Art / Photo / Video / Music buttons and reports the chosen pieces. */
function filters(el, onChange) {
  const choose = (type) => {
    el.innerHTML = ["all", ...TYPES]
      .map((t) => {
        const count = t === "all" ? PIECES.length : PIECES.filter((p) => p.type === t).length;
        return `<button type="button" data-type="${t}" aria-pressed="${t === type}">${t === "all" ? "All" : LABEL[t]} <span>${count}</span></button>`;
      })
      .join("");
    onChange(type === "all" ? PIECES : PIECES.filter((p) => p.type === type));
  };
  el.onclick = (event) => {
    const button = event.target.closest("button");
    if (button) choose(button.dataset.type);
  };
  choose("all");
}

/** The floating bar for stepping between options. Left out of the picker page's previews. */
function switcher() {
  if (window.top !== window) return;
  const i = OPTIONS.findIndex(([file]) => location.pathname.endsWith(file));
  if (i < 0) return;
  const at = (k) => OPTIONS[(k + OPTIONS.length) % OPTIONS.length];
  const link = "color:#fff;text-decoration:none;opacity:.75;padding:4px";
  const bar = document.createElement("nav");
  bar.setAttribute("aria-label", "Design options");
  bar.style.cssText =
    "position:fixed;z-index:999;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:10px;align-items:center;padding:6px 16px;border-radius:999px;background:#111;color:#fff;font:500 13px/1.2 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.35);white-space:nowrap;text-transform:none;letter-spacing:0";
  bar.innerHTML = `<a style="${link}" href="${at(i - 1)[0]}" aria-label="Previous option: ${at(i - 1)[1]}">←</a><b>${i + 1}/${OPTIONS.length} · ${OPTIONS[i][1]}</b><a style="${link}" href="${at(i + 1)[0]}" aria-label="Next option: ${at(i + 1)[1]}">→</a><a style="${link}" href="index.html">All options</a>`;
  document.body.append(bar);
}

/** Puts the sun and moon icons in the page's #theme button and makes it switch modes.
    Each option starts in the mode set on its <html>; `?theme=dark` overrides it. */
function themeToggle() {
  const root = document.documentElement;
  root.dataset.theme = new URLSearchParams(location.search).get("theme") ?? root.dataset.theme ?? "light";
  const button = document.getElementById("theme");
  const label = () =>
    button.setAttribute("aria-label", root.dataset.theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  button.innerHTML = ICON.sun + ICON.moon;
  button.onclick = () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    label();
  };
  label();
  document.head.insertAdjacentHTML(
    "beforeend",
    "<style>[data-theme=dark] .i-moon,[data-theme=light] .i-sun{display:none}</style>",
  );
}

/** Shows `piece(p)` for `#/work/<id>`, `about()` for `#/about` and `home()` for anything else.
    The current view is on <body data-view> for styling. */
function route({ home, piece, about }) {
  const go = () => {
    const p = PIECES.find((q) => location.hash === `#/work/${q.id}`);
    const view = p ? "piece" : location.hash === "#/about" ? "about" : "home";
    document.body.dataset.view = view;
    if (p) piece(p);
    else if (view === "about") about();
    else home();
    scrollTo(0, 0);
  };
  addEventListener("hashchange", go);
  go();
  themeToggle();
  switcher();
}
