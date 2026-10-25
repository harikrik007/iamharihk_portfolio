# Content to fill in

Everything below is already wired up. Each item appears on the site as soon as you fill it in (in `src/lib/content.ts` unless noted). Until then, nothing shows: there are no empty boxes or "coming soon" labels on the live site.

## 1. Screenshots and short videos (the biggest gap)

One per project. Slugs: `agentbaba`, `agent-marketplace`, `avatar-studio`.

- `public/work/<slug>/poster.webp`: a screenshot, about 1600×1000, under 300 KB. Avoid anything that shows customer data.
- Optional: `public/work/<slug>/loop.webm` and `loop.mp4`, a 6–10 second muted loop, each under 2 MB.

Then add to that project in `content.ts`:

```ts
media: {
  src: "/work/agentbaba/poster.webp",
  alt: "AgentBaba workspace with AI workers running in the background",
  width: 1600,
  height: 1000,
  webm: "/work/agentbaba/loop.webm", // optional
  mp4: "/work/agentbaba/loop.mp4",   // optional
},
```

It shows inside a terminal-style browser frame above the "My role" box.

## 2. Numbers

- `metric` on each project: one real number, e.g. minutes talked, websites live, or workers deployed. On Avatar Studio it replaces the "Gaining traction" badge.
- `impact` on each project: one sentence about a result.
- Hero stats (`stats`): currently 2015 / 4 live AI products / 1st autonomous store. Swap one for a traction number if you have one.

## 3. Links and files (`profile` in content.ts)

| Field | What to put | What appears |
| --- | --- | --- |
| `cv` | Put the PDF at `public/cv/Harikrishnan_M_CV.pdf`, then set `"/cv/Harikrishnan_M_CV.pdf"` | "Download CV" in the hero and contact |
| `github` | e.g. `https://github.com/harikrik007` (this repo is public) | GitHub link in contact, and in the search-engine profile |
| `calendar` | A Cal.com or Google booking link | "Book a call" in contact |

## 4. Avatar Studio live demo ("Talk to my avatar")

Needs two things from your Avatar Studio dashboard:

1. The embed snippet for a demo agent.
2. `www.iamharihk.com` added to that agent's allowed websites.

Send both and the button can be wired to load the embed only when clicked, never on page load.

## 5. Facts to confirm

- **Stack tooltips** (`skillUses`): Flutter, Dart and Python are tagged "AgentBaba", from your LinkedIn project entry. FastAPI, Django, Next.js, React, IoT and C/C++ have no tooltip yet. Say which project each was used in.
- **Stealth startup:** your role, the exact dates, and whether you're named on the US patent.
- **CrateHunt dates:** the site shows 2019–2024 (from LinkedIn), which overlaps the 2022 stealth startup.
- **Photo:** optional.
