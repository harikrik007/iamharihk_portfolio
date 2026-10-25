import { bootLog, profile, stats } from "@/lib/content";
import { sceneAnchor } from "@/lib/scenes";
import { ExternalLink } from "../ExternalLink";
import { delay, Stage } from "../Stage";

export function Hero() {
  return (
    <Stage scene="core" wide>
      <p className="label hero-in" style={delay(100)}>
        <span className="text-ember">01</span> {"//"} system online
      </p>
      <h1 className="hero-in mt-5 text-[clamp(3rem,7vw,5.75rem)] leading-[0.9] font-semibold tracking-[-0.045em] md:whitespace-nowrap" style={delay(180)}>
        {profile.name}
      </h1>
      <p className="hero-in mt-4 text-lg font-medium md:text-2xl" style={delay(260)}>
        <span className="bg-linear-to-r from-ember to-cyan bg-clip-text text-transparent">{profile.title}</span>
        <span className="text-muted"> at </span>
        <ExternalLink href={profile.companyUrl} className="link-underline" arrow={false}>
          {profile.company}
        </ExternalLink>
      </p>
      <p className="hero-in mt-5 max-w-xl text-base leading-relaxed text-paper/80 md:text-lg" style={delay(340)}>
        {profile.intro}
      </p>

      <div className="hero-in mt-7 flex flex-wrap gap-3" style={delay(420)}>
        <a href="#work" className="btn btn-primary">
          See what I&apos;ve built
        </a>
        <ExternalLink href={profile.linkedin} className="btn btn-ghost">
          LinkedIn
        </ExternalLink>
        {profile.cv && (
          <a href={profile.cv} download className="btn btn-link">
            Download CV
          </a>
        )}
      </div>

      <dl className="hero-in mt-9 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-6" style={delay(500)}>
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="sr-only">{stat.label}</dt>
            <dd className="text-2xl font-semibold tracking-tight md:text-3xl">{stat.value}</dd>
            <dd className="mt-1 text-xs leading-snug text-muted">{stat.label}</dd>
          </div>
        ))}
      </dl>

      <nav
        aria-label="Career log"
        className="hero-in mt-9 max-w-sm rounded-xl border border-white/10 bg-ink/50 p-3.5 font-mono text-xs backdrop-blur-md"
        style={delay(580)}
      >
        <div className="mb-2 flex items-center justify-between tracking-[0.16em] text-muted uppercase">
          <span>career.log</span>
          <span className="flex items-center gap-1.5">
            <span className="status-dot size-1.5 rounded-full bg-emerald-400" /> live
          </span>
        </div>
        <ul>
          {bootLog.map((line) => (
            <li key={line.process}>
              <a
                href={sceneAnchor(line.scene)}
                className="group -mx-1.5 flex items-center gap-3 rounded px-1.5 py-1 transition-colors hover:bg-white/5 pointer-coarse:min-h-11"
              >
                <span className={line.state === "run" ? "text-ember" : "text-cyan/80"}>
                  {line.state === "run" ? "[ RUN ]" : "[  OK ]"}
                </span>
                <span className="flex-1 text-paper/85 group-hover:text-paper">{line.process}</span>
                <span className={line.state === "run" ? "blink text-ember" : "text-muted"}>{line.when}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Stage>
  );
}
