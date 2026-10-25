import { contact, liveProducts, profile } from "@/lib/content";
import { delay, SectionLabel, Stage } from "../Stage";

export function Contact() {
  return (
    <Stage scene="galaxy" id="contact" wide>
      <SectionLabel index="06">Contact</SectionLabel>
      <h2 data-reveal className="text-[clamp(2.8rem,8vw,6rem)] leading-[0.92] font-semibold tracking-[-0.04em]" style={delay(80)}>
        {contact.heading}
      </h2>
      <p data-reveal className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-paper/75 md:text-lg" style={delay(160)}>
        {contact.body}
      </p>
      <div data-reveal className="mt-9 flex flex-wrap justify-center gap-3" style={delay(240)}>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn btn-primary">
          Message me on LinkedIn ↗
        </a>
        {profile.email && (
          <a href={`mailto:${profile.email}`} className="btn btn-ghost">
            {profile.email}
          </a>
        )}
      </div>

      <div data-reveal className="mt-16" style={delay(320)}>
        <p className="label">Live products I work on</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {liveProducts.map((product) => (
            <li key={product.url}>
              <a href={product.url} target="_blank" rel="noreferrer" className="chip chip-link">
                {product.name} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="mt-20 font-mono text-xs tracking-[0.12em] text-muted uppercase">
        © 2026 {profile.name} · Built with Next.js & React Three Fiber
      </footer>
    </Stage>
  );
}
