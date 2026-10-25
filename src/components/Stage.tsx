import type { ReactNode } from "react";
import { SCENES, sceneIndex, type SceneId } from "@/lib/scenes";

// A full-height scroll stage tied to one 3D scene. The text column sits on the
// opposite side from where the shape is drawn.
export function Stage({
  scene,
  id,
  wide = false,
  className = "",
  children,
}: {
  scene: SceneId;
  id?: string;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const index = sceneIndex(scene);
  const { side } = SCENES[index];
  const align = side === 1 ? "md:mr-auto" : side === -1 ? "md:ml-auto" : "mx-auto text-center";

  return (
    <section id={id} data-scene={index} className={`flex min-h-svh scroll-mt-0 items-center py-28 md:py-36 ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div data-text-column className={`${wide ? "max-w-2xl" : "max-w-xl"} ${align}`}>
          {children}
        </div>
      </div>
    </section>
  );
}

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p data-reveal className="label mb-6">
      <span className="text-ember">{index}</span> {"//"} {children}
    </p>
  );
}

export function delay(ms: number) {
  return { "--delay": `${ms}ms` } as React.CSSProperties;
}
