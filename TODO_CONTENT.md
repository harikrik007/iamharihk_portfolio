# Content to fill in

Everything below is already wired up. Each item appears on the site as soon as you fill it in (in `src/lib/content.ts` unless noted). Until then, nothing shows: there are no empty boxes or "coming soon" labels on the live site.

## Done

- **Project screenshots:** `public/work/<slug>/poster.webp`, taken from the public, logged-out landing pages of agentbaba.ai, agentbaba.ai/agent-marketplace and avatar.agentbaba.ai.
- **CV:** `public/cv/Harikrishnan_M_CV.pdf`, built from `cv/cv.html` (see the comment at the top of that file to regenerate it). It shows as "Download CV" in the hero and contact sections.
- **Dates:** every journey chapter and the CV use the exact months from LinkedIn.

## 1. Avatar Studio live demo ("Talk to my avatar")

Needs two things from your Avatar Studio dashboard:

1. The embed snippet for a demo agent.
2. `www.iamharihk.com` added to that agent's allowed websites.

Send both and the button can be wired to load the embed only when clicked, never on page load.

## 2. Numbers

- `metric` on each project: one real number, e.g. minutes talked, websites live, or workers deployed. On Avatar Studio it replaces the "Gaining traction" badge.
- `impact` on each project: one sentence about a result.

## 3. Optional links (`profile` in content.ts)

| Field | What to put | What appears |
| --- | --- | --- |
| `github` | `https://github.com/harikrik007` | A GitHub link in the contact section and in the search-engine profile |
| `calendar` | A Cal.com or Google booking link | "Book a call" in the contact section |

## 4. Optional extras

- Short muted loops for the project frames: `public/work/<slug>/loop.webm` and `loop.mp4`, 6–10 seconds, each under 2 MB. Add `webm` and `mp4` to that project's `media`.
- **Stack tooltips** (`skillUses`): Flutter, Dart and Python are tagged "AgentBaba", from your LinkedIn project entry. FastAPI, Django, Next.js, React, IoT and C/C++ have no tooltip yet. Say which project each was used in.
- **Patent:** say whether you're named on the US patent, if you want that mentioned.
- **Photo:** optional.
