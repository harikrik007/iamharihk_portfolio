// Simplex 3D noise by Ian McEwan and Stefan Gustavson (Ashima Arts), MIT licence.
const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

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
// Cursor in NDC, how strongly it pushes particles away (0 = off), and the
// screen aspect ratio so the push is round.
uniform vec2 uMouse;
uniform float uRepel;
uniform float uAspect;

attribute vec3 aPosA;
attribute vec3 aPosB;
attribute float aSeed;

varying float vTint;
varying float vSpark;
varying float vFade;
varying float vText;

${simplexNoise}

// 0 inside the rectangle, rising to 1 one feather-width outside it.
float outside(vec4 r, vec2 p) {
  vec2 d = max(r.xy - p, p - r.zw) / uFeather;
  return clamp(max(d.x, d.y), 0.0, 1.0);
}

void main() {
  // Stagger the morph per particle so shapes dissolve in waves rather than slide.
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

  // A slow noise field drifts every particle a little, so shapes breathe.
  vec3 q = p * 0.55 + vec3(0.0, 0.0, uTime * 0.07);
  p += 0.06 * uMotion * vec3(
    snoise(q),
    snoise(q + vec3(17.1, 4.3, 0.0)),
    snoise(q + vec3(-8.2, 31.7, 0.0))
  );

  vec4 mv = modelViewMatrix * vec4(p, 1.0);

  // Push particles away from the cursor, in view space so it works at any depth.
  if (uRepel > 0.0) {
    vec4 clip = projectionMatrix * mv;
    vec2 away = (clip.xy / clip.w - uMouse) * vec2(uAspect, 1.0);
    float push = uRepel * exp(-dot(away, away) / 0.05);
    mv.xy += normalize(away + 1e-5) * push * 0.45;
  }

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
