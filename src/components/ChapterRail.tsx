import { SCENES } from "@/lib/scenes";

const pad = (n: number) => String(n).padStart(2, "0");

// A tick per chapter down the right edge. ScrollDirector marks the current one
// with aria-current; labels show on hover and focus.
export function ChapterRail() {
  return (
    <nav aria-label="Chapters" className="fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 md:block">
      <ol className="flex flex-col items-end">
        {SCENES.map((scene, i) => (
          <li key={scene.id}>
            <a href={`#${scene.anchor}`} data-rail={i} className="rail-link group flex min-h-6 min-w-6 items-center justify-end pl-3">
              <span className="rail-label font-mono text-xs tracking-[0.12em] whitespace-nowrap text-muted uppercase">
                {pad(i + 1)} · {scene.label}
              </span>
              <span aria-hidden className="rail-tick block h-px w-3 bg-white/35" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
