// Shared, mutable state between the DOM (scroll, pointer) and the WebGL scene.
// Written by ScrollDirector, read every frame inside useFrame. Kept outside
// React on purpose so scrolling never triggers a re-render.
export const sceneState = {
  /** Continuous scene index: 2.4 means 40% of the way from scene 2 to scene 3. */
  morph: 0,
  /** Whole-page scroll progress, 0 to 1. */
  progress: 0,
  /** Pointer position, -1 to 1 on both axes. */
  pointer: { x: 0, y: 0 },
  reducedMotion: false,
};
