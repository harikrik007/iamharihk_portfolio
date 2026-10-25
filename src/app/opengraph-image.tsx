import { ImageResponse } from "next/og";
import { profile } from "@/lib/content";

export const alt = `${profile.name} · ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "radial-gradient(circle at 78% 40%, #3a1a0c 0%, #06070a 55%)",
          color: "#ececf1",
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: "#8b8f9c" }}>
          SYSTEM // {profile.name.toUpperCase().replace(/\s+/g, "_")}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>{profile.name}</div>
          <div style={{ marginTop: 24, fontSize: 40, color: "#ff7a3d" }}>{profile.title}</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#8b8f9c" }}>{profile.tagline}</div>
      </div>
    ),
    size,
  );
}
