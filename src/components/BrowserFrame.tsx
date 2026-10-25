import Image from "next/image";
import type { Project } from "@/lib/content";

// A screenshot (or short muted loop) in a terminal-style browser window.
export function BrowserFrame({ url, media }: { url: string; media: NonNullable<Project["media"]> }) {
  const video = media.webm || media.mp4;
  return (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-ink/60 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2 font-mono text-xs text-muted">
        <span className="size-2.5 rounded-full bg-ember/80" />
        <span className="size-2.5 rounded-full bg-cyan/70" />
        <span className="size-2.5 rounded-full bg-white/25" />
        <span className="ml-2 truncate">{url.replace("https://", "")}</span>
      </div>
      {video ? (
        <video
          className="block h-auto w-full"
          width={media.width}
          height={media.height}
          poster={media.src}
          aria-label={media.alt}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        >
          {media.webm && <source src={media.webm} type="video/webm" />}
          {media.mp4 && <source src={media.mp4} type="video/mp4" />}
        </video>
      ) : (
        <Image
          className="block h-auto w-full"
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          sizes="(max-width: 768px) 100vw, 576px"
        />
      )}
    </figure>
  );
}
