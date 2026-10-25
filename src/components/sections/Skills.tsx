import { skills } from "@/lib/content";
import { delay, SectionLabel, Stage } from "../Stage";

export function Skills() {
  return (
    <Stage scene="lattice">
      <SectionLabel index="05">Stack</SectionLabel>
      <h2 data-reveal className="heading-xl" style={delay(80)}>
        What I work with.
      </h2>
      <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
        {skills.map((group, i) => (
          <div key={group.group} data-reveal style={delay(140 + i * 60)}>
            <h3 className="label text-paper/90">{group.group}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item} className="chip">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Stage>
  );
}
