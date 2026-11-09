/**
 * LifeOS mark: a 24-hour ring (one segment per hour) around a geometric "L".
 * Same geometry as scripts/gen-icons.mjs so the icon, iOS splash and in-app splash line up.
 */
const C = 512;
const R = 326;
const W = 60;
const GAP = 3.6;

const rad = (d: number) => ((d - 90) * Math.PI) / 180;
function arc(r: number, a0: number, a1: number) {
  const x0 = C + r * Math.cos(rad(a0));
  const y0 = C + r * Math.sin(rad(a0));
  const x1 = C + r * Math.cos(rad(a1));
  const y1 = C + r * Math.sin(rad(a1));
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export const SEGMENTS = Array.from({ length: 24 }, (_, i) => arc(R, i * 15 + GAP / 2, (i + 1) * 15 - GAP / 2));
/** The "now" tick, drawn at hour 0 and rotated into place; it pops slightly outward. */
export const NOW_TICK = arc(R + W * 0.22, GAP / 2, 15 - GAP / 2);
export const NOW_TICK_WIDTH = W * 1.44;
export const RING_WIDTH = W;
export const L_PATH =
  "M440 384h40a12 12 0 0 1 12 12v180h96a12 12 0 0 1 12 12v40a12 12 0 0 1-12 12H440a12 12 0 0 1-12-12V396a12 12 0 0 1 12-12z";

/** Static mark (currentColor) with `now` hours filled. */
export function HourRing({ now = 16, className }: { now?: number; className?: string }) {
  return (
    <svg viewBox="0 0 1024 1024" className={className} aria-hidden>
      {SEGMENTS.map((d, i) =>
        i === now ? null : (
          <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth={W} strokeOpacity={i < now ? 1 : 0.16} />
        )
      )}
      <path d={NOW_TICK} fill="none" stroke="#00d294" strokeWidth={NOW_TICK_WIDTH} transform={`rotate(${now * 15} 512 512)`} />
      <path d={L_PATH} fill="currentColor" />
    </svg>
  );
}
