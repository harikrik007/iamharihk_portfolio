import { ImageResponse } from "next/og";
import { profile } from "@/lib/content";

export const alt = `${profile.name} · ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const EMBER = [255, 122, 61];
const CYAN = [61, 220, 255];

// The hero's particle globe, drawn as dots: a Fibonacci sphere plus one tilted
// orbit, coloured ember at the bottom to cyan at the top like the 3D scene.
function globeDots() {
  const dots: { x: number; y: number; r: number; color: string; alpha: number }[] = [];
  const cx = 1000;
  const cy = 300;
  const radius = 175;
  const tilt = 0.5;
  const add = (x: number, y: number, z: number) => {
    const t = (y + 1) / 2;
    const c = EMBER.map((e, k) => Math.round(e + (CYAN[k] - e) * t));
    dots.push({
      x: cx + x * radius,
      y: cy - y * radius,
      r: 1.6 + (z + 1) * 1.3,
      color: `rgb(${c.join(",")})`,
      alpha: 0.25 + ((z + 1) / 2) * 0.75,
    });
  };
  const n = 420;
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + 0.5) / n) * 2;
    const ring = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5));
    add(Math.cos(a) * ring, y, Math.sin(a) * ring);
  }
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2;
    const x = Math.cos(a) * 1.45;
    const z = Math.sin(a) * 1.45;
    add(x, -z * Math.sin(tilt) * 0.45, Math.max(-1, Math.min(1, z * Math.cos(tilt) * 0.7)));
  }
  return dots;
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "radial-gradient(circle at 82% 48%, #102633 0%, #06070a 52%)",
          color: "#ececf1",
        }}
      >
        {globeDots().map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.x - d.r,
              top: d.y - d.r,
              width: d.r * 2,
              height: d.r * 2,
              borderRadius: 9999,
              background: d.color,
              opacity: d.alpha,
            }}
          />
        ))}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: 72,
          }}
        >
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: "#9ea3b0" }}>
            SYSTEM // {profile.name.toUpperCase().replace(/\s+/g, "_")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
            <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>{profile.name}</div>
            <div style={{ marginTop: 22, fontSize: 36, color: "#ff7a3d" }}>{profile.title}</div>
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#9ea3b0" }}>{profile.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
