export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uMix;
uniform float uSize;
uniform float uPixelRatio;
uniform float uMotion;
// Text columns on screen as (x0, y0, x1, y1) in NDC, the soft edge width in
// NDC, and how visible particles stay over text.
uniform vec4 uTextA;
uniform vec4 uTextB;
uniform vec2 uFeather;
uniform float uTextMin;

attribute vec3 aPosA;
attribute vec3 aPosB;
attribute float aSeed;

varying float vTint;
varying float vSpark;
varying float vFade;
varying float vText;

// 0 inside the rectangle, rising to 1 one feather-width outside it.
float outside(vec4 r, vec2 p) {
  vec2 d = max(r.xy - p, p - r.zw) / uFeather;
  return clamp(max(d.x, d.y), 0.0, 1.0);
}

void main() {
  // Stagger the morph per particle so shapes dissolve rather than slide.
  float d = clamp(uMix * 1.6 - aSeed * 0.6, 0.0, 1.0);
  d = d * d * (3.0 - 2.0 * d);
  vec3 p = mix(aPosA, aPosB, d);

  // Particles swirl outward while they travel, then settle into the next shape.
  float travel = sin(d * 3.14159265);
  vec3 swirl = vec3(
    sin(aSeed * 91.0 + uTime * 0.6),
    cos(aSeed * 57.0 + uTime * 0.5),
    sin(aSeed * 33.0 - uTime * 0.4)
  );
  p += swirl * travel * 0.55;

  // Idle breathing.
  p += 0.035 * uMotion * vec3(
    sin(uTime * 0.9 + aSeed * 40.0),
    cos(uTime * 0.8 + aSeed * 31.0),
    sin(uTime * 0.7 + aSeed * 23.0)
  );

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (0.45 + aSeed * aSeed * 1.1) * uPixelRatio / -mv.z;

  // Push particles towards either ember or cyan; a 50/50 blend of the two reads as grey.
  float tint = 0.5 + p.y * 0.22 + p.x * 0.08 + (aSeed - 0.5) * 0.8;
  vTint = smoothstep(0.25, 0.75, tint);
  vSpark = step(0.965, aSeed);
  vFade = smoothstep(14.0, 4.0, -mv.z);

  vec2 ndc = gl_Position.xy / gl_Position.w;
  float clear = min(outside(uTextA, ndc), outside(uTextB, ndc));
  vText = mix(uTextMin, 1.0, smoothstep(0.0, 1.0, clear));
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;

varying float vTint;
varying float vSpark;
varying float vFade;
varying float vText;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float alpha = pow(1.0 - d * 2.0, 1.7);
  vec3 color = mix(uColorA, uColorB, vTint);
  color = mix(color, vec3(1.0), vSpark * 0.75);
  gl_FragColor = vec4(color, alpha * uOpacity * (0.85 + vSpark * 0.15) * vFade * vText);
}
`;
