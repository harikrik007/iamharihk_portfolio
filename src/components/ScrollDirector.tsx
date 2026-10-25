"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { SCENES } from "@/lib/scenes";
import { sceneState } from "@/lib/sceneState";

type Box = { left: number; right: number; top: number; bottom: number };
type Stage = { center: number; index: number; column: Box | null };

// Extra room around each text column before particles start to fade.
const TEXT_PAD = 20;

function toggleCurrent(el: HTMLElement, on: boolean, value: string) {
  if (on) el.setAttribute("aria-current", value);
  else el.removeAttribute("aria-current");
}

// Drives everything scroll-related: smooth scrolling, the scene morph value,
// text-safe zones, the progress bar, the chapter rail and active header link,
// and reveal-on-scroll. Renders nothing.
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
        const col = el.querySelector("[data-text-column]")?.getBoundingClientRect();
        return {
          center: rect.top + window.scrollY + rect.height / 2,
          index: Number(el.dataset.scene),
          column: col
            ? { left: col.left, right: col.right, top: col.top + window.scrollY, bottom: col.bottom + window.scrollY }
            : null,
        };
      });
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);

    // Hands the shader the text columns nearest the middle of the screen.
    const writeTextRects = (focus: number) => {
      const top = window.scrollY;
      const bottom = top + window.innerHeight;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const visible = stages
        .filter((s) => s.column && s.column.bottom > top && s.column.top < bottom)
        .sort((a, b) => Math.abs(a.center - focus) - Math.abs(b.center - focus));
      const rects = sceneState.textRects;
      rects.fill(9);
      visible.slice(0, 2).forEach(({ column }, k) => {
        const c = column!;
        rects[k * 4] = ((c.left - TEXT_PAD) / w) * 2 - 1;
        rects[k * 4 + 1] = 1 - ((c.bottom - top + TEXT_PAD) / h) * 2;
        rects[k * 4 + 2] = ((c.right + TEXT_PAD) / w) * 2 - 1;
        rects[k * 4 + 3] = 1 - ((c.top - top - TEXT_PAD) / h) * 2;
      });
    };

    const railLinks = Array.from(document.querySelectorAll<HTMLElement>("[data-rail]"));
    const navLinks = Array.from(document.querySelectorAll<HTMLElement>("[data-nav]"));
    let currentIndex = -1;
    // Marks the current chapter on the rail and its section in the header.
    const markCurrent = (index: number) => {
      railLinks.forEach((el) => toggleCurrent(el, Number(el.dataset.rail) === index, "step"));
      const section = SCENES[index].section;
      navLinks.forEach((el) => toggleCurrent(el, el.dataset.nav === section, "true"));
    };

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
      writeTextRects(focus);

      const scrollable = root.scrollHeight - window.innerHeight;
      sceneState.progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      root.style.setProperty("--progress", sceneState.progress.toFixed(4));

      const current = Math.round(morph);
      if (current !== currentIndex) {
        currentIndex = current;
        markCurrent(current);
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
      sceneState.pointerActive = event.pointerType !== "touch";
    };
    const onLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) sceneState.pointerActive = false;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerout", onLeave);

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = "true";
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

    return () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      resizeObserver.disconnect();
      reveal.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerout", onLeave);
    };
  }, []);

  return null;
}
