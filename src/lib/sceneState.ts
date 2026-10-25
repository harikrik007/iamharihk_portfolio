// Shared mutable state between the DOM scroll controller and the WebGL scene.
// Written by ScrollDirector, read inside useFrame, so no React re-renders.
export const sceneState = {
  morph: 0,
  progress: 0,
  pointer: { x: 0, y: 0 },
  // True while a mouse or pen is over the page; touch never sets it.
  pointerActive: false,
  reducedMotion: false,
  // Up to two on-screen text columns as [x0, y0, x1, y1] in normalized device
  // coordinates. Particles inside them fade out so they never cover copy.
  // 9 is far off-screen, i.e. "no rectangle".
  textRects: new Float32Array(8).fill(9),
};
