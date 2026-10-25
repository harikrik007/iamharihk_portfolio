import { journey } from "@/lib/content";
import { delay, SectionLabel, Stage } from "../Stage";

export function Journey() {
  return (
    <>
      {journey.map((era, i) => (
        <Stage key={era.title} scene={era.scene} id={i === 0 ? "journey" : undefined}>
          {i === 0 && <SectionLabel index="03">Journey</SectionLabel>}
          <p data-reveal className="font-mono text-sm tracking-[0.14em] text-ember" style={delay(60)}>
            {era.years}
          </p>
          <h3 data-reveal className="heading-xl mt-3" style={delay(120)}>
            {era.title}
          </h3>
          <p data-reveal className="mt-3 text-sm text-muted md:text-base" style={delay(180)}>
            {era.subtitle}
          </p>
          <p data-reveal className="mt-6 text-base leading-relaxed text-paper/80 md:text-lg" style={delay(240)}>
            {era.body}
          </p>
          {era.points && (
            <ul className="mt-6 space-y-3">
              {era.points.map((point, j) => (
                <li key={point} data-reveal className="bullet text-paper/85" style={delay(300 + j * 70)}>
                  {point}
                </li>
              ))}
            </ul>
          )}
          {era.note && (
            <p data-reveal className="mt-7 border-l-2 border-ember/70 pl-4 text-sm leading-relaxed text-paper/70" style={delay(520)}>
              {era.note}
            </p>
          )}
        </Stage>
      ))}
    </>
  );
}
