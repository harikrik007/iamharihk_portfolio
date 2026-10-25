// One entry per scroll "stage". The particle field morphs from one shape to the
// next as each stage scrolls past, so the order here must match page order.
// side: where the 3D shape sits on wide screens (1 right, -1 left, 0 centre).
// The stage's text goes on the opposite side.
export const SCENES = [
  { id: "core", label: "Boot", side: 1, opacity: 1 },
  { id: "helix", label: "About", side: -1, opacity: 1 },
  { id: "phone", label: "Mobile · 2015", side: 1, opacity: 1 },
  { id: "store", label: "Watasale · 2018", side: -1, opacity: 1 },
  { id: "crosshair", label: "CrateHunt · 2019", side: 1, opacity: 1 },
  { id: "plate", label: "Stealth · 2022", side: -1, opacity: 1 },
  { id: "knot", label: "Immilearn · 2024", side: 1, opacity: 1 },
  { id: "database", label: "AgentBaba", side: -1, opacity: 1 },
  { id: "hub", label: "Agent Marketplace", side: 1, opacity: 1 },
  { id: "face", label: "Avatar Studio", side: -1, opacity: 1 },
  { id: "lattice", label: "Stack", side: 1, opacity: 0.85 },
  { id: "galaxy", label: "Contact", side: 0, opacity: 0.55 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export function sceneIndex(id: SceneId) {
  return SCENES.findIndex((scene) => scene.id === id);
}
