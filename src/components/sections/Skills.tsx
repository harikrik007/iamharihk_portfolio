import { skills, skillUses } from "@/lib/content";
import { delay, SectionLabel, Stage } from "../Stage";

export function Skills() {
  return (
    <Stage scene="lattice">
      <SectionLabel index="05">Stack</SectionLabel>
      <h2 data-reveal className="heading-xl" style={delay(80)}>
        What I work with.
      </h2>
      <p data-reveal className="mt-4 text-sm text-muted" style={delay(110)}>
        Hover or focus a skill to see where I used it.
      </p>
      <div className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2">
        {skills.map((group, i) => (
          <div key={group.group} data-reveal style={delay(140 + i * 60)}>
            <h3 className="label text-paper/90">{group.group}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.items.map((item) => {
                const used = skillUses[item];
                if (!used) {
                  return (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  );
                }
                const id = `skill-${item.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
                return (
                  <li key={item} className="group relative">
                    <span tabIndex={0} aria-describedby={id} className="chip chip-link cursor-default">
                      {item}
                    </span>
                    {/* Not rendered until shown, so it never widens the page on phones. */}
                    <span
                      id={id}
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-max max-w-[60vw] rounded-md border border-white/15 bg-ink/95 px-2.5 py-1.5 font-mono text-xs text-paper group-focus-within:block group-hover:block"
                    >
                      Used in {used}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Stage>
  );
}
