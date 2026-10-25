"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/sceneState";
import { mulberry32 } from "./shapes";

// Faint background particles that drift with scroll, for a sense of depth.
export function Dust({ count }: { count: number }) {
  const positions = useMemo(() => {
    const rng = mulberry32(99);
    const out = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      out[i * 3] = (rng() - 0.5) * 24;
      out[i * 3 + 1] = (rng() - 0.5) * 18;
      out[i * 3 + 2] = -2 - rng() * 8;
    }
    return out;
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    const points = ref.current;
    if (!points) return;
    const dt = Math.min(delta, 0.1);
    if (!sceneState.reducedMotion) points.rotation.z += dt * 0.006;
    points.position.y = THREE.MathUtils.damp(points.position.y, sceneState.progress * 6 - 3, 2, dt);
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#8f98ab" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
}
