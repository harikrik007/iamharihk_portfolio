# 3D particle portfolio

The personal site of Harikrishnan M, live at [iamharihk.com](https://www.iamharihk.com), built with Next.js 16 (App Router), React Three Fiber and Lenis. Clone it and make it your own.

A single field of particles (10k on desktop, 7k on low-end machines, 5k on phones) changes shape for each chapter as you scroll: agent core → helix → phone → trolley with a brain → crosshair → number plate → knot → database → hub → woman's face → stack lattice → galaxy. Particles fade wherever text sits on screen, drift on a slow noise field, and move aside from the cursor. All the text is ordinary HTML, so search engines and screen readers read it normally. If a browser can't run WebGL, the page still works without the 3D layer. With reduced motion turned on, shapes swap with a fade instead of morphing.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · three.js · @react-three/fiber · @react-three/drei · Lenis

## Run it

You need Node.js 20.9 or newer.

```bash
git clone https://github.com/harikrik007/iamharihk_portfolio.git
cd iamharihk_portfolio
npm install
npm run dev      # http://localhost:3000
npm run build    # production build, every page static
```

## Make it yours

1. **Your details.** Open `src/lib/content.ts` and replace everything in it: name, initials, title, links, bio, journey, projects, skills and the contact copy. Every component reads its text from this file. Optional extras (CV, GitHub, booking link, project screenshots, metrics) stay hidden until you fill them in; [TODO_CONTENT.md](TODO_CONTENT.md) lists them.
2. **The tab icon.** In `src/app/icon.svg`, change the `HM` text to your initials.
3. **Your story's shapes.** `src/lib/scenes.ts` lists the scenes in scroll order, with each scene's anchor id, its header section, the label on the chapter rail, and which side the shape sits on. The shapes themselves are drawn in `src/components/scene/shapes.ts`. Each one is a small function that returns `count` points, so you can reuse an existing shape or write a new one.
4. **Sections.** The page is put together in `src/app/page.tsx` from the components in `src/components/sections/`. Each `<Stage scene="...">` is a full-screen section. While it sits in the middle of the screen, the particles hold the shape for that scene.

To add a stage, add an entry to `SCENES`, add a builder with the same id in `shapes.ts`, and add a `<Stage scene="id">` at the matching place in the page. The number of `Stage`s must match the number of `SCENES`, in the same order.

## Where things live

| What | File |
| --- | --- |
| All copy (bio, journey, projects, skills, links) | `src/lib/content.ts` |
| Scene order, anchors, sections, side, opacity | `src/lib/scenes.ts` |
| Point-cloud shapes | `src/components/scene/shapes.ts` |
| Morph shader (noise drift, cursor push, text-safe fade) | `src/components/scene/particleShaders.ts` |
| Particle count and quality on slower devices | `src/components/scene/SceneCanvas.tsx` |
| Scroll → morph, text-safe zones, chapter rail, active nav, reveals | `src/components/ScrollDirector.tsx` |
| Header, phone menu, chapter rail | `src/components/Nav.tsx`, `MobileMenu.tsx`, `ChapterRail.tsx` |
| Project screenshot frame, AgentBaba diagram | `src/components/BrowserFrame.tsx`, `RuntimeDiagram.tsx` |
| Theme colours and fonts (the 3D colours read these too) | `src/app/globals.css`, `src/app/layout.tsx` |
| Social share image, robots.txt, sitemap | `src/app/opengraph-image.tsx`, `robots.ts`, `sitemap.ts` |

## Deploy

Import the repo into [Vercel](https://vercel.com/new), or any host that runs Next.js. Put your final address in `siteUrl` in `src/lib/content.ts` (for example `https://yourname.dev`) so social share previews and search engines point to the right place. You can also override it with the `NEXT_PUBLIC_SITE_URL` environment variable.

## License

The code is [MIT](LICENSE), so use it for your own site. The text in `src/lib/content.ts` describes me and my work. Please replace it with your own instead of publishing it under your name.
