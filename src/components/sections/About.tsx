import { about } from "@/lib/content";
import { delay, SectionLabel, Stage } from "../Stage";

export function About() {
  return (
    <Stage scene="helix">
      <SectionLabel index="02">About</SectionLabel>
      <h2 data-reveal className="heading-xl" style={delay(80)}>
        {about.heading}
      </h2>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-paper/75 md:text-lg">
        {about.paragraphs.map((paragraph, i) => (
          <p key={i} data-reveal style={delay(160 + i * 80)}>
            {paragraph}
          </p>
        ))}
      </div>
      <dl data-reveal className="mt-10 divide-y divide-white/10 border-y border-white/10" style={delay(420)}>
        {about.facts.map((fact) => (
          <div key={fact.label} className="grid grid-cols-[7rem_1fr] gap-4 py-3 text-sm">
            <dt className="label pt-0.5">{fact.label}</dt>
            <dd className="text-paper/85">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </Stage>
  );
}
