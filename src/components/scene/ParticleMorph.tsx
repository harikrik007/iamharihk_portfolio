"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SCENES } from "@/lib/scenes";
import { sceneState } from "@/lib/sceneState";
import { fragmentShader, vertexShader } from "./particleShaders";
import { mulberry32, ShapeCache } from "./shapes";

const LAST_PAIR = SCENES.length - 2;
// Width of the soft edge where particles fade out next to text.
const FEATHER_PX = 56;
const { damp, lerp, clamp } = THREE.MathUtils;

// The particle colours come from the same CSS tokens as the rest of the page.
function themeColor(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(value || fallback);
}

export function ParticleMorph({ count }: { count: number }) {
  const shapes = useMemo(() => new ShapeCache(SCENES.map((scene) => scene.id), count), [count]);

  const geometry = useMemo(() => {
    const rng = mulberry32(42);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) seeds[i] = rng();
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(shapes.get(0), 3));
    g.setAttribute("aPosA", new THREE.BufferAttribute(shapes.get(0).slice(), 3));
    g.setAttribute("aPosB", new THREE.BufferAttribute(shapes.get(1).slice(), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, [shapes, count]);

  // Build the remaining shapes one per idle slot, so start-up isn't one long
  // blocking task. A shape needed sooner is built on demand in useFrame.
  useEffect(() => {
    // Safari has no requestIdleCallback.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = (cb: () => void) => (hasIdle ? window.requestIdleCallback(cb, { timeout: 2000 }) : window.setTimeout(cb, 60));
    const cancel = (id: number) => (hasIdle ? window.cancelIdleCallback(id) : window.clearTimeout(id));
    let next = 2;
    let handle = 0;
    const step = () => {
      while (next < SCENES.length && shapes.has(next)) next++;
      if (next >= SCENES.length) return;
      shapes.get(next++);
      handle = idle(step);
    };
    handle = idle(step);
    return () => cancel(handle);
  }, [shapes]);

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
          uColorA: { value: themeColor("--color-ember", "#ff7a3d") },
          uColorB: { value: themeColor("--color-cyan", "#3ddcff") },
          uTextA: { value: new THREE.Vector4(9, 9, 9, 9) },
          uTextB: { value: new THREE.Vector4(9, 9, 9, 9) },
          uFeather: { value: new THREE.Vector2(0.1, 0.1) },
          uTextMin: { value: 0.12 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uRepel: { value: 0 },
          uAspect: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  // shown and fade drive the reduced-motion crossfade between whole scenes.
  const live = useRef({ morph: 0, pair: 0, shown: 0, fade: 1 });
  const viewport = useThree((state) => state.viewport);

  useFrame((state, delta) => {
    const g = group.current;
    const p = points.current;
    if (!g || !p) return;
    const dt = Math.min(delta, 0.1);
    const l = live.current;
    const reduced = sceneState.reducedMotion;

    if (reduced) {
      // No tweening: fade out, swap to the nearest scene, fade back in.
      const target = Math.round(sceneState.morph);
      if (target !== l.shown) {
        l.fade = Math.max(0, l.fade - dt / 0.2);
        if (l.fade === 0) l.shown = target;
      } else {
        l.fade = Math.min(1, l.fade + dt / 0.25);
      }
      l.morph = l.shown;
    } else {
      l.morph = damp(l.morph, sceneState.morph, 3.2, dt);
      l.fade = 1;
    }
    const pair = Math.min(Math.floor(l.morph), LAST_PAIR);
    const mix = clamp(l.morph - pair, 0, 1);

    if (pair !== l.pair) {
      const a = p.geometry.getAttribute("aPosA") as THREE.BufferAttribute;
      const b = p.geometry.getAttribute("aPosB") as THREE.BufferAttribute;
      (a.array as Float32Array).set(shapes.get(pair));
      (b.array as Float32Array).set(shapes.get(pair + 1));
      a.needsUpdate = true;
      b.needsUpdate = true;
      l.pair = pair;
    }

    const from = SCENES[pair];
    const to = SCENES[pair + 1];
    const ease = mix * mix * (3 - 2 * mix);
    const narrow = viewport.aspect < 1;
    const motion = reduced ? 0 : 1;
    const t = state.clock.elapsedTime;
    const { pointer } = sceneState;

    const u = p.material.uniforms;
    u.uMix.value = mix;
    u.uTime.value = t * motion;
    u.uMotion.value = motion;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uOpacity.value = lerp(from.opacity, to.opacity, ease) * (narrow ? 0.7 : 1) * l.fade;

    const r = sceneState.textRects;
    u.uTextA.value.set(r[0], r[1], r[2], r[3]);
    u.uTextB.value.set(r[4], r[5], r[6], r[7]);
    u.uFeather.value.set((2 * FEATHER_PX) / state.size.width, (2 * FEATHER_PX) / state.size.height);
    // Phones have no empty side for the shape, so it stays faintly visible behind the text.
    u.uTextMin.value = narrow ? 0.3 : 0.12;

    u.uAspect.value = state.size.width / state.size.height;
    u.uMouse.value.set(damp(u.uMouse.value.x, pointer.x, 8, dt), damp(u.uMouse.value.y, -pointer.y, 8, dt));
    u.uRepel.value = damp(u.uRepel.value, sceneState.pointerActive && !reduced ? 1 : 0, 4, dt);

    const sideX = (narrow ? 0 : lerp(from.side, to.side, ease)) * viewport.width * 0.24;
    const scale = narrow ? 0.72 : 1;
    if (reduced) {
      g.position.x = sideX;
      g.scale.setScalar(scale);
      g.rotation.set(0, 0, 0);
      return;
    }
    g.position.x = damp(g.position.x, sideX, 3, dt);
    g.scale.setScalar(damp(g.scale.x, scale, 3, dt));
    g.rotation.y = damp(g.rotation.y, Math.sin(t * 0.25) * 0.35 + pointer.x * 0.35, 2.5, dt);
    g.rotation.x = damp(g.rotation.x, Math.cos(t * 0.2) * 0.08 - pointer.y * 0.2, 2.5, dt);
  });

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}
