"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/content";
import { NAV_LINKS, sceneAnchor } from "@/lib/scenes";
import { ExternalLink } from "./ExternalLink";

// Full-screen menu for phones. Focus stays inside while it's open; Esc closes it.
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("button, a")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        toggle.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>("button, a"));
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = "";
    };
  }, [open]);

  // Unlock scrolling before the click reaches the smooth-scroll anchor handler.
  const go = () => {
    document.documentElement.style.overflow = "";
    setOpen(false);
  };

  return (
    <>
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="grid size-11 place-items-center rounded-lg border border-white/15 bg-white/5 md:hidden"
      >
        <span aria-hidden className="flex w-5 flex-col gap-1.5">
          <span className="block h-px bg-paper" />
          <span className="block h-px w-3.5 bg-paper" />
        </span>
      </button>

      <div
        id="mobile-menu"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        data-lenis-prevent
        className="menu-in fixed inset-0 z-50 overflow-y-auto bg-ink/97 px-6 pt-5 pb-10 backdrop-blur-xl md:hidden"
      >
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => {
              setOpen(false);
              toggle.current?.focus();
            }}
            className="grid size-11 place-items-center rounded-lg border border-white/15 bg-white/5 text-xl leading-none"
          >
            <span aria-hidden>×</span>
          </button>
        </div>

        <nav aria-label="Main" className="mt-8">
          <ul className="space-y-1">
            {NAV_LINKS.map((link, i) => (
              <li key={link.section}>
                <a
                  href={`#${link.section}`}
                  data-nav={link.section}
                  onClick={go}
                  className="flex min-h-14 items-baseline gap-4 text-4xl font-semibold tracking-tight text-paper/85 aria-[current=true]:text-paper"
                >
                  <span className="font-mono text-xs text-ember">{String(i + 2).padStart(2, "0")}</span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 flex flex-wrap gap-3">
          <a href="#work" onClick={go} className="btn btn-primary">
            See what I&apos;ve built
          </a>
          <ExternalLink href={profile.linkedin} className="btn btn-ghost">
            LinkedIn
          </ExternalLink>
        </div>

        <a
          href={sceneAnchor("face")}
          onClick={go}
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 font-mono text-xs tracking-[0.12em] text-paper/85 uppercase"
        >
          <span className="status-dot size-1.5 rounded-full bg-emerald-400" />
          {profile.status}
        </a>
      </div>
    </>
  );
}
