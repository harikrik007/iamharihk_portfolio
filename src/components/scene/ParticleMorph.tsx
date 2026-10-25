"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SCENES } from "@/lib/scenes";
import { sceneState } from "@/lib/sceneState";
import { fragmentShader, vertexShader } from "./particleShaders";
import { buildShape, mulberry32 } from "./shapes";

const LAST_PAIR = SCENES.length - 2;
// Width of the soft edge where particles fade out next to text.
const FEATHER_PX = 56;
const { damp, lerp, clamp } = THREE.MathUtils;

export function ParticleMorph({ count }: { count: number }) {
  const shapes = useMemo(() => SCENES.map((scene) => buildShape(scene.id, count)), [count]);

  const geometry = useMemo(() => {
    const rng = mulberry32(42);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) seeds[i] = rng();
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(shapes[0], 3));
    g.setAttribute("aPosA", new THREE.BufferAttribute(shapes[0].slice(), 3));
    g.setAttribute("aPosB", new THREE.BufferAttribute(shapes[1].slice(), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [shapes, count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uMix: { value: 0 },
          uSize: { value: 26 },
          uPixelRatio: { value: 1 },
          uMotion: { value: 1 },
          uOpacity: { value: 1 },
          uColorA: { value: new THREE.Color("#ff7a3d") },
          uColorB: { value: new THREE.Color("#3ddcff") },
          uTextA: { value: new THREE.Vector4(9, 9, 9, 9) },
          uTextB: { value: new THREE.Vector4(9, 9, 9, 9) },
          uFeather: { value: new THREE.Vector2(0.1, 0.1) },
          uTextMin: { value: 0.12 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const live = useRef({ morph: 0, pair: 0 });
  const viewport = useThree((state) => state.viewport);

  useFrame((state, delta) => {
    const g = group.current;
    const p = points.current;
    if (!g || !p) return;
    const dt = Math.min(delta, 0.1);
    const l = live.current;

    l.morph = damp(l.morph, sceneState.morph, 3.2, dt);
    const pair = Math.min(Math.floor(l.morph), LAST_PAIR);
    const mix = clamp(l.morph - pair, 0, 1);

    if (pair !== l.pair) {
      const a = p.geometry.getAttribute("aPosA") as THREE.BufferAttribute;
      const b = p.geometry.getAttribute("aPosB") as THREE.BufferAttribute;
      (a.array as Float32Array).set(shapes[pair]);
      (b.array as Float32Array).set(shapes[pair + 1]);
      a.needsUpdate = true;
      b.needsUpdate = true;
      l.pair = pair;
    }

    const from = SCENES[pair];
    const to = SCENES[pair + 1];
    const ease = mix * mix * (3 - 2 * mix);
    const narrow = viewport.aspect < 1;
    const motion = sceneState.reducedMotion ? 0 : 1;
    const t = state.clock.elapsedTime;

    const u = p.material.uniforms;
    u.uMix.value = mix;
    u.uTime.value = t * motion;
    u.uMotion.value = motion;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uOpacity.value = lerp(from.opacity, to.opacity, ease) * (narrow ? 0.7 : 1);

    const r = sceneState.textRects;
    u.uTextA.value.set(r[0], r[1], r[2], r[3]);
    u.uTextB.value.set(r[4], r[5], r[6], r[7]);
    u.uFeather.value.set((2 * FEATHER_PX) / state.size.width, (2 * FEATHER_PX) / state.size.height);
    // Phones have no empty side for the shape, so it stays faintly visible behind the text.
    u.uTextMin.value = narrow ? 0.3 : 0.12;

    const side = narrow ? 0 : lerp(from.side, to.side, ease);
    g.position.x = damp(g.position.x, side * viewport.width * 0.24, 3, dt);
    const scale = narrow ? 0.72 : 1;
    g.scale.setScalar(damp(g.scale.x, scale, 3, dt));

    const { pointer } = sceneState;
    g.rotation.y = damp(g.rotation.y, Math.sin(t * 0.25) * 0.35 * motion + pointer.x * 0.35, 2.5, dt);
    g.rotation.x = damp(g.rotation.x, Math.cos(t * 0.2) * 0.08 * motion - pointer.y * 0.2, 2.5, dt);
  });

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
