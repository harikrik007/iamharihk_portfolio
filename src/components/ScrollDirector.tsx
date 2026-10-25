"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { SCENES } from "@/lib/scenes";
import { sceneState } from "@/lib/sceneState";

type Stage = { center: number; index: number };

// Drives everything scroll-related: smooth scrolling, the scene morph value,
// the progress bar, the scene HUD and reveal-on-scroll. Renders nothing.
export function ScrollDirector() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sceneState.reducedMotion = reduced;
    const lenis = reduced ? null : new Lenis({ autoRaf: false, anchors: true, lerp: 0.09 });

    let stages: Stage[] = [];
    const measure = () => {
      stages = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]")).map((el) => {
        const rect = el.getBoundingClientRect();
        return { center: rect.top + window.scrollY + rect.height / 2, index: Number(el.dataset.scene) };
      });
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);

    const hud = document.getElementById("scene-hud");
    let hudIndex = -1;

    const update = () => {
      if (!stages.length) return;
      const focus = window.scrollY + window.innerHeight / 2;
      let morph = stages[0].index;
      if (focus >= stages[stages.length - 1].center) {
        morph = stages[stages.length - 1].index;
      } else {
        for (let i = 0; i < stages.length - 1; i++) {
          const a = stages[i];
          const b = stages[i + 1];
          if (focus >= a.center && focus < b.center) {
            // Hold each shape through the middle of its stage, morph near the edges.
            const t = (focus - a.center) / (b.center - a.center);
            const eased = Math.min(1, Math.max(0, (t - 0.2) / 0.6));
            morph = a.index + (b.index - a.index) * eased;
            break;
          }
        }
      }
      sceneState.morph = morph;

      const scrollable = root.scrollHeight - window.innerHeight;
      sceneState.progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      root.style.setProperty("--progress", sceneState.progress.toFixed(4));

      const current = Math.round(morph);
      if (hud && current !== hudIndex) {
        hudIndex = current;
        const total = String(SCENES.length).padStart(2, "0");
        hud.textContent = `${String(current + 1).padStart(2, "0")} / ${total} · ${SCENES[current].label}`;
      }
    };

    let frame = 0;
    const loop = (time: number) => {
      lenis?.raf(time);
      update();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const onPointer = (event: PointerEvent) => {
      sceneState.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = "true";
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

    return () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      resizeObserver.disconnect();
      reveal.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return null;
}
