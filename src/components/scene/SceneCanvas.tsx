"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Dust } from "./Dust";
import { ParticleMorph } from "./ParticleMorph";

// Particle count by device tier. More than this mostly washes out under
// additive blending without making the shapes any clearer.
function particleCount() {
  if (window.matchMedia("(max-width: 767px)").matches) return 5000;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  return lowEnd ? 7000 : 10000;
}

export default function SceneCanvas() {
  // Client-only component (loaded with ssr: false), so window is available here.
  const [maxDpr] = useState(() => Math.min(1.5, window.devicePixelRatio || 1));
  const [dpr, setDpr] = useState(maxDpr);
  const [count] = useState(particleCount);

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
