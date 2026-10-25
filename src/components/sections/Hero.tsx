import { bootLog, profile, stats } from "@/lib/content";
import { delay, Stage } from "../Stage";

export function Hero() {
  return (
    <Stage scene="core" id="top" wide>
      <p className="label hero-in" style={delay(100)}>
        <span className="text-ember">01</span> {"//"} system online
      </p>
      <h1 className="hero-in mt-6 text-[clamp(3rem,7vw,5.75rem)] leading-[0.9] font-semibold tracking-[-0.045em] md:whitespace-nowrap" style={delay(200)}>
        {profile.name}
      </h1>
      <p className="hero-in mt-5 text-lg font-medium md:text-2xl" style={delay(320)}>
        <span className="bg-linear-to-r from-ember to-cyan bg-clip-text text-transparent">{profile.title}</span>
        <span className="text-muted"> at </span>
        <a href={profile.companyUrl} target="_blank" rel="noreferrer" className="link-underline">
          {profile.company}
        </a>
      </p>
      <p className="hero-in mt-6 max-w-xl text-base leading-relaxed text-paper/75 md:text-lg" style={delay(440)}>
        {profile.intro}
      </p>

      <div className="hero-in mt-8 max-w-md rounded-xl border border-white/10 bg-ink/50 p-4 font-mono text-[12px] backdrop-blur-md" style={delay(560)}>
        <div className="mb-3 flex items-center justify-between text-[10px] tracking-[0.2em] text-muted uppercase">
          <span>career.log</span>
          <span className="flex items-center gap-1.5">
            <span className="status-dot size-1.5 rounded-full bg-emerald-400" /> live
          </span>
        </div>
        <ul className="space-y-1.5">
          {bootLog.map((line) => (
            <li key={line.process} className="flex items-center gap-3">
              <span className={line.state === "run" ? "text-ember" : "text-cyan/80"}>
                {line.state === "run" ? "[ RUN ]" : "[  OK ]"}
              </span>
              <span className="flex-1 text-paper/85">{line.process}</span>
              <span className={line.state === "run" ? "blink text-ember" : "text-muted"}>{line.when}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hero-in mt-8 flex flex-wrap gap-3" style={delay(680)}>
        <a href="#work" className="btn btn-primary">
          See what I&apos;ve built
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost">
          LinkedIn ↗
        </a>
      </div>

      <dl className="hero-in mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-6" style={delay(800)}>
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="sr-only">{stat.label}</dt>
            <dd className="text-2xl font-semibold tracking-tight md:text-3xl">{stat.value}</dd>
            <dd className="mt-1 text-xs leading-snug text-muted">{stat.label}</dd>
          </div>
        ))}
      </dl>
    </Stage>
  );
}
