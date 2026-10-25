# Content to fill in

Everything below is already wired up. Each item appears on the site as soon as you fill it in (in `src/lib/content.ts` unless noted). Until then, nothing shows: there are no empty boxes or "coming soon" labels on the live site.

## Done

- **Project screenshots:** `public/work/<slug>/poster.webp`, taken from the public, logged-out landing pages of agentbaba.ai, agentbaba.ai/agent-marketplace and avatar.agentbaba.ai.
- **CV:** `public/cv/Harikrishnan_M_CV.pdf`, built from `cv/cv.html` (see the comment at the top of that file to regenerate it). It shows as "Download CV" in the hero and contact sections.
- **Dates:** every journey chapter and the CV use the exact months from LinkedIn.

## 1. Avatar Studio widget

The embed is on the site (`profile.avatarEmbed` in content.ts) and loads in browser idle time. For it to appear, `www.iamharihk.com` must be in the allowed websites for that key in your Avatar Studio dashboard. Add `iamharihk-portfolio.vercel.app` too if you want it on the Vercel address, and `localhost` for local development.

## 2. Numbers

- `metric` on each project: one real number, e.g. minutes talked, websites live, or workers deployed. On Avatar Studio it replaces the "Gaining traction" badge.
- `impact` on each project: one sentence about a result.

## 3. Optional links (`profile` in content.ts)

| Field | What to put | What appears |
| --- | --- | --- |
| `calendar` | A Cal.com or Google booking link | "Book a call" in the contact section |

## 4. Optional extras

- Short muted loops for the project frames: `public/work/<slug>/loop.webm` and `loop.mp4`, 6–10 seconds, each under 2 MB. Add `webm` and `mp4` to that project's `media`.
- **Stack tooltips** (`skillUses`): Flutter, Dart and Python are tagged "AgentBaba", from your LinkedIn project entry. FastAPI, Django, Next.js, React, IoT and C/C++ have no tooltip yet. Say which project each was used in.
- **Patent:** say whether you're named on the US patent, if you want that mentioned.
- **Photo:** optional.
