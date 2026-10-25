import { profile } from "@/lib/content";

const links = [
  { href: "#about", label: "About" },
  { href: "#journey", label: "Journey" },
  { href: "#work", label: "Work" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  return (
    <>
      <div aria-hidden className="progress-bar fixed left-0 top-0 z-50 h-0.5 w-full origin-left bg-linear-to-r from-ember to-cyan" />
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-ink/70 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
          <a href="#top" className="group flex items-center gap-3" aria-label={`${profile.name}, back to top`}>
            <span className="grid size-9 place-items-center rounded-lg border border-white/15 bg-white/5 font-mono text-xs font-semibold tracking-wider transition-colors group-hover:border-ember/60">
              {profile.initials}
            </span>
            <span className="hidden font-mono text-xs tracking-[0.18em] text-muted uppercase sm:inline">{profile.handle}</span>
          </a>
          <ul className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase transition-colors hover:text-paper">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-paper/80 uppercase backdrop-blur-md">
            <span className="status-dot size-1.5 rounded-full bg-emerald-400" />
            {profile.status}
          </span>
        </nav>
      </header>
      <p
        id="scene-hud"
        aria-hidden
        className="fixed right-6 bottom-6 z-40 hidden font-mono text-[11px] tracking-[0.2em] text-muted uppercase md:block"
      >
        01 / 12 · Boot
      </p>
    </>
  );
}
