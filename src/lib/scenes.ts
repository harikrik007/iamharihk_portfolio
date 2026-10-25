// One entry per scroll "stage". The particle field morphs from one shape to the
// next as each stage scrolls past, so the order here must match page order.
// anchor: the stage's element id, for links and the chapter rail.
// section: the header link that lights up while this stage is on screen.
// side: where the 3D shape sits on wide screens (1 right, -1 left, 0 centre).
// The stage's text goes on the opposite side.
export const SCENES = [
  { id: "core", anchor: "top", section: "", label: "Boot", side: 1, opacity: 1 },
  { id: "helix", anchor: "about", section: "about", label: "About", side: -1, opacity: 1 },
  { id: "phone", anchor: "journey", section: "journey", label: "Mobile · 2015", side: 1, opacity: 1 },
  { id: "cart", anchor: "watasale", section: "journey", label: "Watasale · 2018", side: -1, opacity: 1 },
  { id: "crosshair", anchor: "cratehunt", section: "journey", label: "CrateHunt · 2019", side: 1, opacity: 1 },
  { id: "plate", anchor: "stealth", section: "journey", label: "Stealth · 2022", side: -1, opacity: 1 },
  { id: "knot", anchor: "immilearn", section: "journey", label: "Immilearn · 2024", side: 1, opacity: 1 },
  { id: "database", anchor: "work", section: "work", label: "AgentBaba", side: -1, opacity: 1 },
  { id: "hub", anchor: "agent-marketplace", section: "work", label: "Agent Marketplace", side: 1, opacity: 1 },
  { id: "face", anchor: "avatar-studio", section: "work", label: "Avatar Studio", side: -1, opacity: 1 },
  { id: "lattice", anchor: "stack", section: "stack", label: "Stack", side: 1, opacity: 0.85 },
  { id: "galaxy", anchor: "contact", section: "contact", label: "Contact", side: 0, opacity: 0.55 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const NAV_LINKS = [
  { section: "about", label: "About" },
  { section: "journey", label: "Journey" },
  { section: "work", label: "Work" },
  { section: "stack", label: "Stack" },
  { section: "contact", label: "Contact" },
] as const;

export function sceneIndex(id: SceneId) {
  return SCENES.findIndex((scene) => scene.id === id);
}

export function sceneAnchor(id: SceneId) {
  return `#${SCENES[sceneIndex(id)].anchor}`;
}
