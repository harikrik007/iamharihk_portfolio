import { projects } from "@/lib/content";
import { delay, SectionLabel, Stage } from "../Stage";

export function Work() {
  return (
    <>
      {projects.map((project, i) => (
        <Stage key={project.name} scene={project.scene} id={i === 0 ? "work" : undefined}>
          {i === 0 && <SectionLabel index="04">Selected work</SectionLabel>}
          <p data-reveal className="label" style={delay(60)}>
            <span className="text-cyan">{String(i + 1).padStart(2, "0")}</span> · {project.kicker}
          </p>
          <div data-reveal className="mt-3 flex flex-wrap items-center gap-3" style={delay(120)}>
            <h3 className="heading-xl">{project.name}</h3>
            {project.status && (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-emerald-300 uppercase">
                <span className="status-dot size-1.5 rounded-full bg-emerald-400" />
                {project.status}
              </span>
            )}
          </div>
          <p data-reveal className="mt-5 text-base leading-relaxed text-paper/80 md:text-lg" style={delay(180)}>
            {project.summary}
          </p>

          <div data-reveal className="mt-8 rounded-xl border border-white/10 bg-ink/40 p-5 backdrop-blur-md" style={delay(260)}>
            <p className="label">My role</p>
            <p className="mt-1.5 font-medium">{project.role}</p>
            <ul className="mt-4 space-y-2.5">
              {project.built.map((item) => (
                <li key={item} className="bullet text-sm text-paper/80 md:text-base">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <ul data-reveal className="mt-6 flex flex-wrap gap-2" style={delay(340)}>
            {project.facts.map((fact) => (
              <li key={fact} className="chip">
                {fact}
              </li>
            ))}
          </ul>

          <a data-reveal href={project.url} target="_blank" rel="noreferrer" className="btn btn-ghost mt-8" style={delay(400)}>
            Visit {project.url.replace("https://", "")} ↗
          </a>
        </Stage>
      ))}
    </>
  );
}
