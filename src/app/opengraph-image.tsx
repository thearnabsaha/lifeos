import { ImageResponse } from "next/og";
import { SEGMENTS, NOW_TICK, NOW_TICK_WIDTH, RING_WIDTH, L_PATH } from "@/components/HourRing";

export const alt = "LifeOS: One line. Every hour.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NOW = 14;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#070707",
          color: "#fafafa",
          padding: "72px 80px",
          position: "relative",
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 600 }}>
            <svg width="44" height="44" viewBox="0 0 1024 1024">
              <rect width="1024" height="1024" rx="228" fill="#fafafa" />
              {SEGMENTS.map((d, i) =>
                i === NOW ? null : (
                  <path key={i} d={d} fill="none" stroke="#070707" strokeWidth={RING_WIDTH} strokeOpacity={i < NOW ? 1 : 0.2} />
                )
              )}
              <path d={NOW_TICK} fill="none" stroke="#00bb7f" strokeWidth={NOW_TICK_WIDTH} transform={`rotate(${NOW * 15} 512 512)`} />
              <path d={L_PATH} fill="#070707" />
            </svg>
            LifeOS
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>One line.</div>
            <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -4, lineHeight: 1.05, color: "#5a5a5a" }}>Every hour.</div>
            <div style={{ marginTop: 28, fontSize: 28, color: "#a1a1a1", maxWidth: 560 }}>
              A 24-slot log for your day, with an MCP server for your AI.
            </div>
          </div>
          <div style={{ display: "flex", gap: 28, fontSize: 18, letterSpacing: 4, color: "#a1a1a1", textTransform: "uppercase" }}>
            <span>Free forever</span>
            <span>·</span>
            <span>No ads</span>
            <span>·</span>
            <span>Offline-first</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 440 }}>
          <svg width="420" height="420" viewBox="0 0 1024 1024">
            {SEGMENTS.map((d, i) =>
              i === NOW ? null : (
                <path key={i} d={d} fill="none" stroke="#fafafa" strokeWidth={RING_WIDTH} strokeOpacity={i < NOW ? 1 : 0.14} />
              )
            )}
            <path d={NOW_TICK} fill="none" stroke="#00d294" strokeWidth={NOW_TICK_WIDTH} transform={`rotate(${NOW * 15} 512 512)`} />
            <path d={L_PATH} fill="#fafafa" />
          </svg>
        </div>
      </div>
    ),
    size
  );
}
