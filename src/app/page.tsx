import { AvatarWidget } from "@/components/AvatarWidget";
import { Nav } from "@/components/Nav";
import { ScrollDirector } from "@/components/ScrollDirector";
import { SceneLoader } from "@/components/scene/SceneLoader";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Skills } from "@/components/sections/Skills";
import { Work } from "@/components/sections/Work";
import { profile, skills } from "@/lib/content";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: profile.siteUrl,
  jobTitle: profile.title,
  description: profile.description,
  email: profile.email || undefined,
  worksFor: { "@type": "Organization", name: profile.companyLegalName, url: profile.companyUrl },
  alumniOf: { "@type": "CollegeOrUniversity", name: profile.school },
  address: { "@type": "PostalAddress", addressRegion: profile.region, addressCountry: profile.countryCode },
  sameAs: [profile.linkedin, profile.github].filter(Boolean),
  knowsAbout: skills.flatMap((group) => group.items),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
      />
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-paper px-4 py-2 text-sm font-medium text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <AvatarWidget />
      <SceneLoader />
      <div aria-hidden className="vignette pointer-events-none fixed inset-0 z-[1]" />
      <ScrollDirector />
      <Nav />
      <main id="main" tabIndex={-1} className="relative z-10 outline-none">
        <Hero />
        <About />
        <Journey />
        <Work />
        <Skills />
        <Contact />
      </main>
    </>
  );
}
