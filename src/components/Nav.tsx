import { profile } from "@/lib/content";
import { NAV_LINKS, sceneAnchor } from "@/lib/scenes";
import { ChapterRail } from "./ChapterRail";
import { MobileMenu } from "./MobileMenu";

export function Nav() {
  return (
    <>
      <div aria-hidden className="progress-bar fixed left-0 top-0 z-50 h-0.5 w-full origin-left bg-linear-to-r from-ember to-cyan" />
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5">
        {/* The blur lives on its own layer: backdrop-filter on the header itself would
            trap the phone menu's position: fixed inside the header box. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-ink/70 backdrop-blur-md" />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-10 md:py-5">
          <a href="#top" className="group flex min-h-11 items-center gap-3" aria-label={`${profile.name}, back to top`}>
            <span className="grid size-9 place-items-center rounded-lg border border-white/15 bg-white/5 font-mono text-xs font-semibold tracking-wider transition-colors group-hover:border-ember/60">
              {profile.initials}
            </span>
            <span className="hidden font-mono text-xs tracking-[0.18em] text-muted uppercase sm:inline">{profile.handle}</span>
          </a>
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <li key={link.section}>
                  <a
                    href={`#${link.section}`}
                    data-nav={link.section}
                    className="font-mono text-xs tracking-[0.15em] text-muted uppercase underline-offset-8 transition-colors hover:text-paper aria-[current=true]:text-paper aria-[current=true]:underline aria-[current=true]:decoration-ember"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={sceneAnchor("face")}
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs tracking-[0.12em] text-paper/85 uppercase backdrop-blur-md transition-colors hover:border-emerald-400/50 hover:text-paper sm:flex"
            >
              <span className="status-dot size-1.5 rounded-full bg-emerald-400" />
              {profile.status}
            </a>
            <MobileMenu />
          </div>
        </div>
      </header>
      <ChapterRail />
    </>
  );
}
