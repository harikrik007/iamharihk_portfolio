import type { SceneId } from "@/lib/scenes";

// Procedural point clouds, one per scene. Every shape returns exactly `count`
// points so the shader can morph particle i of one shape into particle i of the
// next. Generation is seeded, so server and client (and every reload) agree.

type Vec3 = [number, number, number];
type Rng = () => number;
type Sampler = (rng: Rng, i: number, n: number) => Vec3;

const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const jitter = (rng: Rng, amount: number) => (rng() - 0.5) * 2 * amount;

function rotate([x, y, z]: Vec3, rx: number, ry: number, rz = 0): Vec3 {
  const y1 = y * Math.cos(rx) - z * Math.sin(rx);
  const z1 = y * Math.sin(rx) + z * Math.cos(rx);
  const x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
  const z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
  return [x2 * Math.cos(rz) - y1 * Math.sin(rz), x2 * Math.sin(rz) + y1 * Math.cos(rz), z2];
}

function fibonacci(i: number, n: number): Vec3 {
  const y = 1 - ((i + 0.5) / n) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = i * GOLDEN_ANGLE;
  return [Math.cos(theta) * radius, y, Math.sin(theta) * radius];
}

function onSphere(rng: Rng, r: number): Vec3 {
  const theta = rng() * TAU;
  const phi = Math.acos(2 * rng() - 1);
  return [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)];
}

function inSphere(rng: Rng, r: number): Vec3 {
  return onSphere(rng, r * Math.cbrt(rng()));
}

function ring(rng: Rng, r: number, spread: number): Vec3 {
  const a = rng() * TAU;
  return [Math.cos(a) * r + jitter(rng, spread), Math.sin(a) * r + jitter(rng, spread), jitter(rng, spread * 2)];
}

/** A point on the outline of a rounded rectangle centred on the origin; s runs 0 to 1. */
function roundedRect(w: number, h: number, r: number, s: number): [number, number] {
  const sw = w - 2 * r;
  const sh = h - 2 * r;
  const arc = (Math.PI * r) / 2;
  const hw = w / 2;
  const hh = h / 2;
  let d = s * (2 * sw + 2 * sh + 4 * arc);
  if (d < sw) return [-hw + r + d, hh];
  d -= sw;
  if (d < arc) {
    const a = Math.PI / 2 - d / r;
    return [hw - r + Math.cos(a) * r, hh - r + Math.sin(a) * r];
  }
  d -= arc;
  if (d < sh) return [hw, hh - r - d];
  d -= sh;
  if (d < arc) {
    const a = -d / r;
    return [hw - r + Math.cos(a) * r, -hh + r + Math.sin(a) * r];
  }
  d -= arc;
  if (d < sw) return [hw - r - d, -hh];
  d -= sw;
  if (d < arc) {
    const a = -Math.PI / 2 - d / r;
    return [-hw + r + Math.cos(a) * r, -hh + r + Math.sin(a) * r];
  }
  d -= arc;
  if (d < sh) return [-hw, -hh + r + d];
  d -= sh;
  const a = Math.PI - d / r;
  return [-hw + r + Math.cos(a) * r, hh - r + Math.sin(a) * r];
}

type Line = [from: Vec3, to: Vec3];
type Segment = [x1: number, y1: number, x2: number, y2: number];

/** Returns a sampler that picks a point on a set of 3D line segments, evenly by length. */
function onLines(lines: Line[]) {
  const lengths = lines.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  return (rng: Rng): Vec3 => {
    let d = rng() * total;
    let k = 0;
    while (k < lines.length - 1 && d > lengths[k]) d -= lengths[k++];
    const [a, b] = lines[k];
    const t = d / lengths[k];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  };
}

/** The same as onLines, for flat 2D segments. */
function onSegments(segments: Segment[]) {
  const pick = onLines(segments.map(([x1, y1, x2, y2]): Line => [[x1, y1, 0], [x2, y2, 0]]));
  return (rng: Rng): [number, number] => {
    const [x, y] = pick(rng);
    return [x, y];
  };
}

/** Splits `count` points between weighted samplers, then applies an optional transform. */
function compose(
  count: number,
  seed: number,
  parts: Array<[weight: number, sample: Sampler]>,
  transform?: (p: Vec3) => Vec3,
): Float32Array {
  const out = new Float32Array(count * 3);
  const rng = mulberry32(seed);
  const total = parts.reduce((sum, [weight]) => sum + weight, 0);
  let index = 0;
  parts.forEach(([weight, sample], part) => {
    const n = part === parts.length - 1 ? count - index : Math.round((weight / total) * count);
    for (let i = 0; i < n && index < count; i++, index++) {
      const p = sample(rng, i, n);
      const [x, y, z] = transform ? transform(p) : p;
      out[index * 3] = x;
      out[index * 3 + 1] = y;
      out[index * 3 + 2] = z;
    }
  });
  return out;
}

// Agent core: a shell with an inner core and three orbiting rings of "workers".
function core(count: number) {
  const tilts: Vec3[] = [
    [1.2, 0.3, 0.2],
    [0.5, 1.1, -0.4],
    [-0.6, 2.2, 0.9],
  ];
  return compose(count, 1, [
    [
      0.58,
      (rng, i, n) => {
        const [x, y, z] = fibonacci(i, n);
        const r = 1.55 + jitter(rng, 0.03);
        return [x * r, y * r, z * r];
      },
    ],
    [0.1, (rng) => inSphere(rng, 0.55)],
    [
      0.32,
      (rng, i) => {
        const [rx, ry, rz] = tilts[i % 3];
        const a = rng() * TAU;
        const r = 2.35 + jitter(rng, 0.04);
        return rotate([Math.cos(a) * r, jitter(rng, 0.02), Math.sin(a) * r], rx, ry, rz);
      },
    ],
  ]);
}

// About: a double helix.
function helix(count: number) {
  const turns = TAU * 2.6;
  const height = 4.6;
  const radius = 1.05;
  return compose(
    count,
    2,
    [
      [
        0.78,
        (rng, i) => {
          const t = rng();
          const a = t * turns + (i % 2) * Math.PI;
          return [Math.cos(a) * radius + jitter(rng, 0.06), (t - 0.5) * height + jitter(rng, 0.04), Math.sin(a) * radius + jitter(rng, 0.06)];
        },
      ],
      [
        0.22,
        (rng) => {
          const t = (Math.floor(rng() * 26) + 0.5) / 26;
          const a = t * turns;
          const s = rng() * 2 - 1;
          return [Math.cos(a) * radius * s, (t - 0.5) * height, Math.sin(a) * radius * s];
        },
      ],
    ],
    (p) => rotate(p, 0, 0, 0.35),
  );
}

// Mobile era: a phone with an app grid.
function phone(count: number) {
  return compose(
    count,
    3,
    [
      [
        0.4,
        (rng) => {
          const [x, y] = roundedRect(1.9, 3.8, 0.32, rng());
          return [x, y, (rng() < 0.5 ? 0.1 : -0.1) + jitter(rng, 0.01)];
        },
      ],
      [
        0.1,
        (rng) => {
          const [x, y] = roundedRect(1.9, 3.8, 0.32, rng());
          return [x, y, jitter(rng, 0.1)];
        },
      ],
      [
        0.38,
        (rng) => {
          const col = Math.floor(rng() * 4);
          const row = Math.floor(rng() * 5);
          return [-0.6 + col * 0.4 + jitter(rng, 0.13), 1.15 - row * 0.45 + jitter(rng, 0.13), 0.11];
        },
      ],
      [
        0.07,
        (rng) => {
          const a = rng() * TAU;
          return [Math.cos(a) * 0.14, -1.55 + Math.sin(a) * 0.14, 0.11];
        },
      ],
      [0.05, (rng) => [jitter(rng, 0.3), 1.68 + jitter(rng, 0.02), 0.11]],
    ],
    (p) => rotate(p, -0.15, -0.35, 0.08),
  );
}

// Watasale: a shopping trolley carrying a brain, for AI-powered checkout.
function cart(count: number) {
  // A point on the wire basket. u runs back to front, v across, h bottom to top.
  const basket = (u: number, v: number, h: number): Vec3 => {
    const x = -0.85 + 1.8 * u + (-0.25 + 0.5 * u) * h;
    return [x, -0.3 + 1.2 * h, (2 * v - 1) * (0.55 + 0.15 * h)];
  };
  const rim = (h: number): Line[] => [
    [basket(0, 0, h), basket(1, 0, h)],
    [basket(0, 1, h), basket(1, 1, h)],
    [basket(0, 0, h), basket(0, 1, h)],
    [basket(1, 0, h), basket(1, 1, h)],
  ];
  const range = (n: number) => Array.from({ length: n + 1 }, (_, k) => k / n);
  const rims = onLines([...rim(1), ...rim(0)]);
  const mesh = onLines([
    ...rim(0.35),
    ...rim(0.7),
    ...range(10).flatMap((u): Line[] => [
      [basket(u, 0, 0), basket(u, 0, 1)],
      [basket(u, 1, 0), basket(u, 1, 1)],
    ]),
    ...range(6).flatMap((v): Line[] => [
      [basket(0, v, 0), basket(0, v, 1)],
      [basket(1, v, 0), basket(1, v, 1)],
    ]),
    ...range(4).map((v): Line => [basket(0, v, 0), basket(1, v, 0)]),
  ]);

  const handleX = -1.45;
  const handleY = 1.2;
  const baseY = -1.2;
  const wheelY = -1.36;
  const wheels: Vec3[] = [
    [-0.95, wheelY, -0.5],
    [-0.95, wheelY, 0.5],
    [0.95, wheelY, -0.5],
    [0.95, wheelY, 0.5],
  ];
  const frame = onLines([
    ...[-1, 1].flatMap((s): Line[] => [
      [basket(0, (s + 1) / 2, 1), [handleX, handleY, s * 0.72]],
      [[-0.95, baseY, s * 0.5], [handleX, handleY, s * 0.72]],
      [[-0.95, baseY, s * 0.5], [0.95, baseY, s * 0.5]],
      [basket(1, (s + 1) / 2, 0), [0.95, baseY, s * 0.5]],
    ]),
    [[-0.95, baseY, -0.5], [-0.95, baseY, 0.5]],
    [[0.95, baseY, -0.5], [0.95, baseY, 0.5]],
    ...wheels.map(([x, , z]): Line => [[x, baseY, z], [x, wheelY, z]]),
  ]);

  // The brain: two hemispheres side by side, sitting in the basket.
  const brainAt = (rng: Rng): { p: Vec3; d: Vec3; s: number } => {
    const s = rng() < 0.5 ? -1 : 1;
    const d = onSphere(rng, 1);
    const dz = d[2] * s < 0 ? d[2] * 0.25 : d[2];
    const dy = d[1] < 0 ? d[1] * 0.75 : d[1];
    return { p: [0.1 + d[0] * 1.12, 1.15 + dy * 0.62, s * 0.18 + dz * 0.4], d, s };
  };
  // Thin wavy maze-like lines on the surface read as the brain's folds.
  const fold = ([dx, dy, dz]: Vec3, s: number) =>
    Math.sin(6.5 * dx + 2.5 * Math.sin(5 * dy)) + Math.sin(6.5 * dy + 2.5 * Math.sin(4.5 * dx + 3 * dz * s));

  return compose(
    count,
    4,
    [
      [
        0.08,
        (rng) => {
          const [x, y, z] = rims(rng);
          return [x + jitter(rng, 0.012), y + jitter(rng, 0.012), z + jitter(rng, 0.012)];
        },
      ],
      [0.18, (rng) => mesh(rng)],
      [
        0.05,
        (rng) => [handleX + jitter(rng, 0.03), handleY + jitter(rng, 0.03), jitter(rng, 0.78)],
      ],
      [0.1, (rng) => frame(rng)],
      [
        0.05,
        (rng) => {
          const [wx, wy, wz] = wheels[Math.floor(rng() * 4)];
          const a = rng() * TAU;
          return [wx + Math.cos(a) * 0.15, wy + Math.sin(a) * 0.15, wz + jitter(rng, 0.04)];
        },
      ],
      [
        0.42,
        (rng) => {
          for (let tries = 0; tries < 40; tries++) {
            const { p, d, s } = brainAt(rng);
            if (Math.abs(fold(d, s)) < 0.16) return p;
          }
          return brainAt(rng).p;
        },
      ],
      [0.05, (rng) => brainAt(rng).p],
    ],
    (p) => {
      const [x, y, z] = rotate([p[0], p[1] - 0.15, p[2]], 0.25, -0.55);
      return [x * 0.82, y * 0.82, z * 0.82];
    },
  );
}

// CrateHunt: a scope crosshair with a few hits.
function crosshair(count: number) {
  const hits: Array<[number, number]> = [
    [0.4, 0.3],
    [-0.7, 0.5],
    [0.2, -0.8],
    [1.3, -0.4],
    [-0.3, -0.2],
  ];
  return compose(
    count,
    5,
    [
      [0.3, (rng) => ring(rng, 2.0, 0.025)],
      [0.14, (rng) => ring(rng, 1.05, 0.02)],
      [
        0.12,
        (rng) => {
          const a = ((Math.floor(rng() * 24) * 2 + rng()) * TAU) / 48;
          return [Math.cos(a) * 2.45, Math.sin(a) * 2.45, jitter(rng, 0.03)];
        },
      ],
      [
        0.3,
        (rng, i) => {
          const a = (i % 4) * (Math.PI / 2);
          const r = 0.35 + rng() * 2.3;
          return [Math.cos(a) * r + jitter(rng, 0.02), Math.sin(a) * r + jitter(rng, 0.02), jitter(rng, 0.06)];
        },
      ],
      [0.04, (rng) => inSphere(rng, 0.09)],
      [
        0.1,
        (rng, i) => {
          const [hx, hy] = hits[i % hits.length];
          const [x, y, z] = inSphere(rng, 0.09);
          return [hx + x, hy + y, z];
        },
      ],
    ],
    (p) => rotate(p, 0.1, 0.25),
  );
}

// Stealth startup: a camera reading a number plate inside its detection box.
const GLYPHS: Record<string, Segment[]> = {
  K: [[0, -1, 0, 1], [0.05, 0, 0.95, 1], [0.05, 0, 0.95, -1]],
  L: [[0, 1, 0, -1], [0, -1, 0.9, -1]],
  "0": [[0, 1, 1, 1], [1, 1, 1, -1], [1, -1, 0, -1], [0, -1, 0, 1]],
  "2": [[0, 1, 1, 1], [1, 1, 1, 0], [1, 0, 0, 0], [0, 0, 0, -1], [0, -1, 1, -1]],
};

function plate(count: number) {
  const text = "KL 2022";
  const charW = 0.4;
  const charH = 0.36;
  const pitch = 0.56;
  const startX = -(text.length * pitch - (pitch - charW)) / 2;
  const glyphs = onSegments(
    [...text].flatMap((char, i) =>
      (GLYPHS[char] ?? []).map(([x1, y1, x2, y2]): Segment => [
        startX + i * pitch + x1 * charW,
        y1 * charH,
        startX + i * pitch + x2 * charW,
        y2 * charH,
      ]),
    ),
  );
  const bx = 2.6;
  const by = 0.95;
  const brackets = onSegments(
    [-1, 1].flatMap((sx) =>
      [-1, 1].flatMap((sy): Segment[] => [
        [sx * bx, sy * by, sx * (bx - 0.5), sy * by],
        [sx * bx, sy * by, sx * bx, sy * (by - 0.32)],
      ]),
    ),
  );
  const camera: Vec3 = [-1.5, 1.8, 1.3];
  return compose(
    count,
    12,
    [
      [
        0.16,
        (rng) => {
          const [x, y] = roundedRect(4.5, 1.3, 0.14, rng());
          return [x, y, jitter(rng, 0.02)];
        },
      ],
      [
        0.05,
        (rng) => {
          const [x, y] = roundedRect(4.3, 1.1, 0.1, rng());
          return [x, y, jitter(rng, 0.01)];
        },
      ],
      [
        0.36,
        (rng) => {
          const [x, y] = glyphs(rng);
          return [x + jitter(rng, 0.018), y + jitter(rng, 0.018), 0.04 + jitter(rng, 0.02)];
        },
      ],
      [
        0.12,
        (rng) => {
          const [x, y] = brackets(rng);
          return [x + jitter(rng, 0.015), y + jitter(rng, 0.015), jitter(rng, 0.02)];
        },
      ],
      [0.05, (rng) => [jitter(rng, 2.45), 0.12 + jitter(rng, 0.025), 0.08]],
      [
        0.05,
        (rng) => {
          const [x, y, z] = inSphere(rng, 0.16);
          return [camera[0] + x * 1.6, camera[1] + y, camera[2] + z];
        },
      ],
      [
        0.11,
        (rng, i) => {
          const tx = i % 2 ? bx : -bx;
          const ty = i % 4 < 2 ? by : -by;
          const t = rng();
          return [camera[0] + (tx - camera[0]) * t, camera[1] + (ty - camera[1]) * t, camera[2] * (1 - t)];
        },
      ],
    ],
    (p) => {
      const [x, y, z] = rotate(p, -0.1, 0.38, 0.03);
      return [x * 0.76, y * 0.76 - 0.1, z * 0.76];
    },
  );
}

// Immilearn: a torus knot, everything connected to everything.
function knot(count: number) {
  return compose(
    count,
    6,
    [
      [
        0.9,
        (rng) => {
          const t = rng() * TAU;
          const tube = 1.45 + 0.62 * Math.cos(3 * t);
          const [ox, oy, oz] = inSphere(rng, 0.2);
          return [tube * Math.cos(2 * t) + ox, tube * Math.sin(2 * t) + oy, 0.87 * Math.sin(3 * t) + oz];
        },
      ],
      [0.1, (rng) => onSphere(rng, 2.7 + jitter(rng, 0.1))],
    ],
    (p) => rotate(p, 0.5, 0.2),
  );
}

// AgentBaba: a three-disk database with data spiralling in.
function database(count: number) {
  const diskY = (disk: number) => 0.95 - disk * 0.95;
  const radius = 1.45;
  return compose(
    count,
    7,
    [
      [
        0.46,
        (rng, i) => {
          const a = rng() * TAU;
          const edge = rng() < 0.5 ? 0.32 : -0.32;
          return [Math.cos(a) * radius, diskY(i % 3) + edge + jitter(rng, 0.015), Math.sin(a) * radius];
        },
      ],
      [
        0.18,
        (rng, i) => {
          const a = rng() * TAU;
          return [Math.cos(a) * radius, diskY(i % 3) + jitter(rng, 0.32), Math.sin(a) * radius];
        },
      ],
      [
        0.14,
        (rng) => {
          const a = rng() * TAU;
          const r = radius * Math.sqrt(rng());
          return [Math.cos(a) * r, diskY(0) + 0.32, Math.sin(a) * r];
        },
      ],
      [
        0.2,
        (rng) => {
          const t = rng();
          const a = t * TAU * 3 + (rng() < 0.5 ? 0 : Math.PI);
          const r = 2.6 - t;
          return [Math.cos(a) * r, 2.2 - t * 4.4, Math.sin(a) * r];
        },
      ],
    ],
    (p) => rotate(p, 0.32, 0.3),
  );
}

// Marketplace: a hub with 27 workers, linked to the hub and to each other.
function hub(count: number) {
  const nodes = Array.from({ length: 27 }, (_, i) => {
    const [x, y, z] = fibonacci(i, 27);
    return [x * 2.3, y * 2.3, z * 2.3] as Vec3;
  });
  return compose(
    count,
    8,
    [
      [0.14, (rng) => onSphere(rng, 0.45 + jitter(rng, 0.02))],
      [
        0.36,
        (rng, i) => {
          const [nx, ny, nz] = nodes[i % 27];
          const [x, y, z] = inSphere(rng, 0.13);
          return [nx + x, ny + y, nz + z];
        },
      ],
      [
        0.38,
        (rng, i) => {
          const [nx, ny, nz] = nodes[i % 27];
          const t = 0.2 + rng() * 0.8;
          return [nx * t + jitter(rng, 0.01), ny * t + jitter(rng, 0.01), nz * t + jitter(rng, 0.01)];
        },
      ],
      [
        0.12,
        (rng, i) => {
          const a = nodes[i % 27];
          const b = nodes[(i + 1) % 27];
          const t = rng();
          return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
        },
      ],
    ],
    (p) => rotate(p, 0.3, 0.2),
  );
}

// Avatar Studio: a woman's face shaped like a mask, framed by long hair.
function face(count: number) {
  const top = 1.55;
  const chin = -1.75;
  const mid = (top + chin) / 2;
  const half = (top - chin) / 2;
  const eyeX = 0.42;
  const eyeY = 0.15;
  const mouthY = -0.88;
  const mouthW = 0.33;
  const strands = 16;
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const side = (rng: Rng) => (rng() < 0.5 ? -1 : 1);

  // Half-width of the face at height y: an egg that narrows towards the chin.
  const halfWidth = (y: number) => {
    const v = (y - mid) / half;
    if (Math.abs(v) >= 1) return 0;
    return 1.12 * Math.sqrt(1 - v * v) * (v < 0 ? 1 - 0.3 * v * v : 1 - 0.08 * v * v);
  };

  // How far the mask comes towards the viewer: a shallow shell with a nose,
  // eye sockets, lips and chin pressed into it.
  const depth = (x: number, y: number) => {
    const ex = x / 1.3;
    const ey = (y - mid) / 1.85;
    let z = 0.95 * Math.sqrt(Math.max(0, 1 - ex * ex - ey * ey));
    const along = clamp01((0.3 - y) / 0.75);
    const tip = y < -0.45 ? Math.exp(-(((y + 0.45) / 0.07) ** 2)) : 1;
    z += 0.36 * along ** 1.5 * tip * Math.exp(-((x / (0.08 + 0.08 * along)) ** 2));
    z -= 0.14 * Math.exp(-(((Math.abs(x) - eyeX) / 0.26) ** 2) - ((y - eyeY) / 0.17) ** 2);
    z += 0.07 * Math.exp(-((x / 0.32) ** 2) - ((y - mouthY) / 0.14) ** 2);
    z += 0.05 * Math.exp(-((x / 0.3) ** 2) - ((y + 1.4) / 0.18) ** 2);
    return z;
  };
  const onFace = (x: number, y: number, lift = 0.02): Vec3 => [x, y, depth(x, y) + lift];
  const inEye = (x: number, y: number) => ((Math.abs(x) - eyeX) / 0.26) ** 2 + ((y - eyeY) / 0.11) ** 2 < 1;

  // Almond eyes, lifted slightly at the outer corners. u runs -1 to 1 across the eye.
  const lid = (s: number, u: number, upper: boolean): [number, number] => {
    const open = upper ? 0.11 * (1 - u * u) ** 0.7 : -0.06 * (1 - u * u) ** 0.9;
    return [s * eyeX + u * 0.25, eyeY + open + 0.035 * u * s];
  };
  const brow = (s: number, u: number): [number, number] => [
    s * (0.2 + 0.58 * u),
    0.47 + 0.14 * Math.sin(Math.PI * u ** 0.7) - 0.08 * u,
  ];
  const mouthLine = (u: number) => mouthY + 0.012 * u * u;
  const upperLip = (u: number) => mouthY + 0.115 * (1 - u * u) ** 0.6 - 0.04 * Math.exp(-((u / 0.16) ** 2));
  const lowerLip = (u: number) => mouthY - 0.14 * (1 - u * u) ** 0.75;
  // Hair hugs the face down to the cheeks, then falls past the jaw.
  const hairSide = (y: number) => (y > mid ? halfWidth(y) : Math.max(0.78, 1.12 - 0.13 * (mid - y)));

  return compose(
    count,
    9,
    [
      [
        0.36,
        (rng) => {
          for (let tries = 0; tries < 40; tries++) {
            const y = chin + rng() * (top - chin);
            const x = jitter(rng, 1.12);
            if (Math.abs(x) < halfWidth(y) && !inEye(x, y)) return onFace(x, y, 0);
          }
          return onFace(0, 0.9, 0);
        },
      ],
      [
        0.09,
        (rng) => {
          const a = rng() * TAU;
          const y = mid + half * Math.cos(a);
          return onFace(Math.sign(Math.sin(a)) * halfWidth(y), y, 0);
        },
      ],
      [
        0.05,
        (rng) => {
          const [x, y] = lid(side(rng), jitter(rng, 1), rng() < 0.6);
          return onFace(x + jitter(rng, 0.005), y + jitter(rng, 0.005));
        },
      ],
      [
        0.015,
        (rng) => {
          const s = side(rng);
          const k = Math.floor(rng() * 6);
          const [x, y] = lid(s, s * (0.3 + k * 0.14), true);
          const t = rng() * (0.06 + k * 0.01);
          return onFace(x + s * 0.48 * t, y + 0.88 * t, 0.04);
        },
      ],
      [
        0.03,
        (rng) => {
          const a = rng() * TAU;
          const r = 0.07 * Math.sqrt(rng());
          return onFace(side(rng) * eyeX + Math.cos(a) * r, eyeY + 0.01 + Math.sin(a) * r, -0.02);
        },
      ],
      [
        0.035,
        (rng) => {
          const u = rng();
          const [x, y] = brow(side(rng), u);
          return onFace(x + jitter(rng, 0.008), y + jitter(rng, 0.016 * (1 - 0.7 * u)));
        },
      ],
      [
        0.05,
        (rng) => {
          const s = side(rng);
          const pick = rng();
          if (pick < 0.45) {
            const a = (-0.55 + rng() * 0.95) * Math.PI;
            return onFace(s * (0.12 + Math.cos(a) * 0.07), -0.44 + Math.sin(a) * 0.07, 0.03);
          }
          if (pick < 0.7) {
            const a = (1.15 + rng() * 0.7) * Math.PI;
            return onFace(Math.cos(a) * 0.06, -0.45 + Math.sin(a) * 0.06, 0.03);
          }
          const y = 0.2 - rng() * 0.56;
          return onFace(s * (0.05 + 0.07 * clamp01((0.3 - y) / 0.75)), y, 0.03);
        },
      ],
      [
        0.045,
        (rng) => {
          const u = jitter(rng, 1);
          const pick = rng();
          const y = pick < 0.4 ? upperLip(u) : pick < 0.75 ? lowerLip(u) : mouthLine(u);
          return onFace(u * mouthW, y);
        },
      ],
      [
        0.04,
        (rng) => {
          const u = jitter(rng, 1);
          const edge = rng() < 0.5 ? upperLip(u) : lowerLip(u);
          const y = mouthLine(u) + (edge - mouthLine(u)) * rng();
          return onFace(u * mouthW, y, 0.03);
        },
      ],
      [
        0.2,
        (rng) => {
          const s = side(rng);
          const k = Math.floor(rng() * strands);
          const layer = k / (strands - 1);
          const startY = top + 0.14 - 0.55 * layer * layer;
          const endY = -2.3 - 0.25 * ((k * 0.618) % 1);
          // Fewer points towards the ends, so each strand tapers off.
          const t = rng() ** 1.4;
          const y = startY + (endY - startY) * t;
          const flow = 0.07 * Math.sin(t * 5 + k * 0.7) + (0.12 + 0.25 * layer) * t * t;
          const x = s * (hairSide(y) + 0.07 + 0.42 * layer + flow);
          return [x + jitter(rng, 0.015), y + jitter(rng, 0.015), 0.3 - 0.45 * layer + jitter(rng, 0.03)];
        },
      ],
    ],
    (p) => {
      const [x, y, z] = rotate([p[0], p[1] + 0.35, p[2]], 0.04, 0.42);
      return [x * 0.8, y * 0.8, z * 0.8];
    },
  );
}

// Stack: a lattice of nodes and edges.
function lattice(count: number) {
  const n = 5;
  const step = 0.6;
  const offset = ((n - 1) * step) / 2;
  const at = (k: number) => k * step - offset;
  return compose(
    count,
    10,
    [
      [
        0.35,
        (rng) => {
          const [x, y, z] = inSphere(rng, 0.06);
          return [at(Math.floor(rng() * n)) + x, at(Math.floor(rng() * n)) + y, at(Math.floor(rng() * n)) + z];
        },
      ],
      [
        0.65,
        (rng) => {
          const axis = Math.floor(rng() * 3);
          const u = at(Math.floor(rng() * n));
          const v = at(Math.floor(rng() * n));
          const t = rng() * (n - 1) * step - offset;
          return axis === 0 ? [t, u, v] : axis === 1 ? [u, t, v] : [u, v, t];
        },
      ],
    ],
    (p) => rotate(p, 0.62, 0.79),
  );
}

// Contact: a three-armed spiral galaxy.
function galaxy(count: number) {
  return compose(
    count,
    11,
    [
      [
        0.82,
        (rng, i) => {
          const t = Math.pow(rng(), 0.7);
          const r = 0.25 + t * 3.0;
          const a = ((i % 3) * TAU) / 3 + r * 1.15 + jitter(rng, 0.35 * (1 - t * 0.5));
          const spread = 0.18 + t * 0.12;
          return [Math.cos(a) * r + jitter(rng, spread), jitter(rng, 0.12 * (1 - t)), Math.sin(a) * r + jitter(rng, spread)];
        },
      ],
      [
        0.18,
        (rng) => {
          const [x, y, z] = inSphere(rng, 0.55);
          return [x, y * 0.5, z];
        },
      ],
    ],
    (p) => rotate(p, 0.95, 0, 0.25),
  );
}

const BUILDERS: Record<SceneId, (count: number) => Float32Array> = {
  core,
  helix,
  phone,
  cart,
  crosshair,
  plate,
  knot,
  database,
  hub,
  face,
  lattice,
  galaxy,
};

export function buildShape(id: SceneId, count: number) {
  return BUILDERS[id](count);
}
