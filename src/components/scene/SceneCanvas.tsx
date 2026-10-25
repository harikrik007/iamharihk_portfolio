"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Dust } from "./Dust";
import { ParticleMorph } from "./ParticleMorph";

export default function SceneCanvas() {
  // Client-only component (loaded with ssr: false), so window is available here.
  const [maxDpr] = useState(() => Math.min(2, window.devicePixelRatio || 1));
  const [dpr, setDpr] = useState(() => Math.min(1.5, maxDpr));
  const [count] = useState(() => (window.matchMedia("(max-width: 767px)").matches ? 5000 : 10000));

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <PerformanceMonitor onIncline={() => setDpr(maxDpr)} onDecline={() => setDpr(1)} />
      <ParticleMorph count={count} />
      <Dust count={count > 6000 ? 900 : 450} />
    </Canvas>
  );
}
