"use client";

import { useEffect, useState } from "react";
import { SEGMENTS, NOW_TICK, NOW_TICK_WIDTH, RING_WIDTH, L_PATH } from "@/components/HourRing";

/**
 * Animated launch splash. Server-rendered so it paints on the very first frame
 * (matching the iOS startup image), then the hour segments fill up to the
 * current hour, the emerald "now" tick lands, and it fades out. Pure CSS, so it
 * never waits on JS or data; it is removed from the DOM after ~1.1s.
 * Shown once per session (see the inline script in layout.tsx).
 */
export function LaunchSplash() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const skip = document.documentElement.classList.contains("no-splash");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setGone(true), skip ? 0 : reduce ? 600 : 1150);
    return () => clearTimeout(t);
  }, []);

  if (gone) return null;

  return (
    <div id="launch-splash" aria-hidden className="launch-splash">
      <div className="launch-splash__inner">
        <svg viewBox="0 0 1024 1024" className="launch-splash__mark">
          {SEGMENTS.map((d, i) => (
            <path key={`b${i}`} d={d} fill="none" stroke="currentColor" strokeWidth={RING_WIDTH} strokeOpacity={0.16} />
          ))}
          {SEGMENTS.map((d, i) => (
            <g key={`f${i}`} className="ls-seg" style={{ "--i": i } as React.CSSProperties}>
              <path d={d} fill="none" stroke="currentColor" strokeWidth={RING_WIDTH} />
            </g>
          ))}
          <g className="ls-now-rot">
            <path className="ls-now" d={NOW_TICK} fill="none" stroke="#00d294" strokeWidth={NOW_TICK_WIDTH} />
          </g>
          <path className="ls-l" d={L_PATH} fill="currentColor" />
        </svg>
        <div className="launch-splash__text">
          <p className="launch-splash__word">LIFEOS</p>
          <p className="launch-splash__tag">ONE LINE · EVERY HOUR</p>
        </div>
      </div>
    </div>
  );
}
