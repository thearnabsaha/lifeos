// Generates LifeOS icons, favicons and iOS startup images.
// Run: node scripts/gen-icons.mjs
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const PUB = join(process.cwd(), "public");
const SRC_APP = join(process.cwd(), "src/app");
mkdirSync(join(PUB, "icons"), { recursive: true });
mkdirSync(join(PUB, "splash"), { recursive: true });

const INK = "#070707";
const PAPER = "#fbfaf8";
const EMERALD = "#00d294";
const NOW = 16; // the "current hour" segment (16:00) — about two thirds of the day logged

const rad = (d) => ((d - 90) * Math.PI) / 180;
const pt = (cx, cy, r, d) => [cx + r * Math.cos(rad(d)), cy + r * Math.sin(rad(d))];
function arc(cx, cy, r, a0, a1) {
  const [x0, y0] = pt(cx, cy, r, a0);
  const [x1, y1] = pt(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/** The mark on a 1024 grid, centred at 512,512. `segments` = 24 (full) or 12 (small sizes). */
function ring({ segments = 24, r = 326, w = 60, gap = 3.6, fg = PAPER, dim = "rgba(251,250,248,0.16)" } = {}) {
  const step = 360 / segments;
  const now = Math.round((NOW / 24) * segments);
  let out = "";
  for (let i = 0; i < segments; i++) {
    const a0 = i * step + gap / 2;
    const a1 = (i + 1) * step - gap / 2;
    const color = i < now ? fg : i === now ? EMERALD : dim;
    // the current hour pops outward a little, like a tick landing
    const rr = i === now ? r + w * 0.22 : r, ww = i === now ? w * 1.44 : w;
    out += `<path d="${arc(512, 512, rr, a0, a1)}" stroke="${color}" stroke-width="${ww}" fill="none" stroke-linecap="butt"/>`;
  }
  return out;
}

/** Centre "L": geometric, built from two bars, like the hand of a clock at rest. */
function letterL({ fg = PAPER, scale = 1 } = {}) {
  const s = scale;
  const x = 512 - 84 * s, y = 512 - 128 * s, t = 64 * s, h = 256 * s, wd = 172 * s, rr = 12 * s;
  return `<path d="M${x + rr} ${y}h${t - 2 * rr}a${rr} ${rr} 0 0 1 ${rr} ${rr}v${h - t - rr}h${wd - t - rr}a${rr} ${rr} 0 0 1 ${rr} ${rr}v${t - 2 * rr}a${rr} ${rr} 0 0 1 -${rr} ${rr}h-${wd - 2 * rr}a${rr} ${rr} 0 0 1 -${rr} -${rr}v-${h - 2 * rr}a${rr} ${rr} 0 0 1 ${rr} -${rr}z" fill="${fg}"/>`;
}

// Apple-style continuous-corner squircle on 1024.
const SQUIRCLE = "M512 0C870 0 1024 154 1024 512S870 1024 512 1024 0 870 0 512 154 0 512 0Z";

function bg(shape) {
  const defs = `<defs><radialGradient id="g" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="#1c1c1c"/><stop offset="0.6" stop-color="${INK}"/></radialGradient></defs>`;
  if (shape === "square") return `${defs}<rect width="1024" height="1024" fill="url(#g)"/>`;
  if (shape === "rounded") return `${defs}<rect width="1024" height="1024" rx="230" fill="url(#g)"/>`;
  return `${defs}<rect width="1024" height="1024" rx="228" fill="url(#g)"/>`;
}

function iconSvg({ shape = "squircle", small = false, safe = 1 } = {}) {
  const inner = small
    ? ring({ segments: 12, r: 330, w: 150, gap: 9 }) // chunky ring, no letter
    : ring() + letterL();
  const tr = safe === 1 ? "" : ` transform="translate(512 512) scale(${safe}) translate(-512 -512)"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${bg(shape)}<g${tr}>${inner}</g></svg>`;
}

/** Transparent mark only (for splash + in-app use). */
export function markSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${ring()}${letterL()}</svg>`;
}

const png = (svg, size, file) => sharp(Buffer.from(svg), { density: Math.max(72, (72 * size) / 1024 * 4) }).resize(size, size).png({ compressionLevel: 9 }).toFile(file);

const full = iconSvg({ shape: "square" });
const rounded = iconSvg({ shape: "squircle" });
const maskable = iconSvg({ shape: "square", safe: 0.86 });
const small = iconSvg({ shape: "rounded", small: true });

writeFileSync(join(PUB, "icons/icon.svg"), rounded);
writeFileSync(join(PUB, "icons/icon-maskable.svg"), maskable);
writeFileSync(join(PUB, "favicon.svg"), small);
writeFileSync(join(SRC_APP, "icon.svg"), small);

await png(full, 1024, join(PUB, "icons/icon-1024.png"));
await png(rounded, 512, join(PUB, "icons/icon-512.png"));
await png(rounded, 192, join(PUB, "icons/icon-192.png"));
await png(maskable, 512, join(PUB, "icons/icon-maskable-512.png"));
await png(full, 180, join(PUB, "apple-touch-icon.png"));
await png(full, 180, join(SRC_APP, "apple-icon.png"));
await png(small, 32, join(PUB, "favicon-32.png"));
await png(small, 16, join(PUB, "favicon-16.png"));

// favicon.ico with embedded PNGs (16, 32, 48)
const icoSizes = [16, 32, 48];
const bufs = await Promise.all(icoSizes.map((s) => sharp(Buffer.from(small), { density: 300 }).resize(s, s).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * bufs.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(bufs.length, 4);
let offset = header.length;
bufs.forEach((b, i) => {
  const o = 6 + i * 16, s = icoSizes[i];
  header.writeUInt8(s, o); header.writeUInt8(s, o + 1); header.writeUInt8(0, o + 2); header.writeUInt8(0, o + 3);
  header.writeUInt16LE(1, o + 4); header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(b.length, o + 8); header.writeUInt32LE(offset, o + 12);
  offset += b.length;
});
const ico = Buffer.concat([header, ...bufs]);
writeFileSync(join(PUB, "favicon.ico"), ico);
writeFileSync(join(SRC_APP, "favicon.ico"), ico);

// iOS startup images: [cssW, cssH, dpr, label]
export const DEVICES = [
  [440, 956, 3, "16 Pro Max"],
  [402, 874, 3, "16 Pro"],
  [420, 912, 3, "Air"],
  [430, 932, 3, "15/14 Pro Max, 15/16 Plus"],
  [393, 852, 3, "15/14 Pro, 15, 16"],
  [428, 926, 3, "14 Plus, 13/12 Pro Max"],
  [390, 844, 3, "14, 13, 12"],
  [375, 812, 3, "13 mini, 12 mini, 11 Pro, X/XS"],
  [414, 896, 3, "11 Pro Max, XS Max"],
  [414, 896, 2, "11, XR"],
  [414, 736, 3, "8 Plus"],
  [375, 667, 2, "SE, 8"],
];

function splashSvg(W, H, dpr, dark) {
  const bgc = dark ? INK : PAPER;
  const fg = dark ? PAPER : INK;
  const dim = dark ? "rgba(251,250,248,0.14)" : "rgba(7,7,7,0.10)";
  const muted = dark ? "#a1a1a1" : "#737373";
  const markCss = 128; // mark size in CSS px
  const m = markCss * dpr;
  const s = m / 1024;
  const cx = W / 2, cy = H / 2 - 18 * dpr;
  const word = 13 * dpr, tag = 10 * dpr;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${bgc}"/>
<g transform="translate(${cx - m / 2} ${cy - m / 2}) scale(${s})">${ring({ fg, dim })}${letterL({ fg })}</g>
<text x="${cx}" y="${cy + m / 2 + 40 * dpr}" text-anchor="middle" font-family="Geist Mono" font-weight="600" font-size="${word}" letter-spacing="${word * 0.42}" fill="${fg}">LIFEOS</text>
<text x="${cx}" y="${cy + m / 2 + 60 * dpr}" text-anchor="middle" font-family="Geist Mono" font-weight="400" font-size="${tag}" letter-spacing="${tag * 0.22}" fill="${muted}">ONE LINE · EVERY HOUR</text>
</svg>`;
}

const startup = [];
for (const [w, h, dpr] of DEVICES) {
  const W = w * dpr, H = h * dpr;
  for (const dark of [true, false]) {
    const name = `splash/apple-splash-${W}x${H}-${dark ? "dark" : "light"}.png`;
    await sharp(Buffer.from(splashSvg(W, H, dpr, dark))).png({ compressionLevel: 9 }).toFile(join(PUB, name));
    startup.push({
      url: `/${name}`,
      media: `screen and (device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait) and (prefers-color-scheme: ${dark ? "dark" : "light"})`,
    });
  }
}
writeFileSync(join(process.cwd(), "src/lib/startupImages.json"), JSON.stringify(startup, null, 2) + "\n");
console.log("done", startup.length, "startup images");
