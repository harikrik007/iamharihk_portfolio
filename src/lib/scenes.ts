// One entry per scroll "stage". The particle field morphs from one shape to the
// next as each stage scrolls past, so the order here must match page order.
// anchor: the stage's element id, for links and the chapter rail.
// side: where the 3D shape sits on wide screens (1 right, -1 left, 0 centre).
// The stage's text goes on the opposite side.
export const SCENES = [
  { id: "core", anchor: "top", label: "Boot", side: 1, opacity: 1 },
  { id: "helix", anchor: "about", label: "About", side: -1, opacity: 1 },
  { id: "phone", anchor: "journey", label: "Mobile · 2015", side: 1, opacity: 1 },
  { id: "cart", anchor: "watasale", label: "Watasale · 2018", side: -1, opacity: 1 },
  { id: "crosshair", anchor: "cratehunt", label: "CrateHunt · 2019", side: 1, opacity: 1 },
  { id: "plate", anchor: "stealth", label: "Stealth · 2022", side: -1, opacity: 1 },
  { id: "knot", anchor: "immilearn", label: "Immilearn · 2024", side: 1, opacity: 1 },
  { id: "database", anchor: "work", label: "AgentBaba", side: -1, opacity: 1 },
  { id: "hub", anchor: "agent-marketplace", label: "Agent Marketplace", side: 1, opacity: 1 },
  { id: "face", anchor: "avatar-studio", label: "Avatar Studio", side: -1, opacity: 1 },
  { id: "lattice", anchor: "stack", label: "Stack", side: 1, opacity: 0.85 },
  { id: "galaxy", anchor: "contact", label: "Contact", side: 0, opacity: 0.55 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export function sceneIndex(id: SceneId) {
  return SCENES.findIndex((scene) => scene.id === id);
}

export function sceneAnchor(id: SceneId) {
  return `#${SCENES[sceneIndex(id)].anchor}`;
}
