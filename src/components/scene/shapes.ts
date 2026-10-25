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

// Watasale: shelves of products watched by ceiling cameras.
function store(count: number) {
  const unitX = (unit: number) => (unit - 1) * 1.55;
  const levelY = (level: number) => -1.25 + level * 0.75;
  const cameraX = (c: number) => -2.1 + c * 1.4;
  return compose(
    count,
    4,
    [
      [
        0.22,
        (rng) => [unitX(Math.floor(rng() * 3)) + jitter(rng, 0.6), levelY(Math.floor(rng() * 4)), jitter(rng, 0.28)],
      ],
      [
        0.08,
        (rng) => [
          unitX(Math.floor(rng() * 3)) + (rng() < 0.5 ? -0.6 : 0.6),
          -1.3 + rng() * 2.6,
          rng() < 0.5 ? -0.28 : 0.28,
        ],
      ],
      [
        0.32,
        (rng) => {
          const level = Math.floor(rng() * 4);
          const slot = Math.floor(rng() * 4);
          const productHeight = 0.38 * (0.6 + ((slot + level) % 3) * 0.2);
          return [
            unitX(Math.floor(rng() * 3)) - 0.45 + slot * 0.3 + jitter(rng, 0.1),
            levelY(level) + 0.05 + rng() * productHeight,
            jitter(rng, 0.18),
          ];
        },
      ],
      [
        0.14,
        (rng) => {
          const line = Math.floor(rng() * 9);
          const along = jitter(rng, 2.6);
          return rng() < 0.5 ? [-2.6 + line * 0.65, -1.75, along * 0.6] : [along, -1.75, -1.5 + line * 0.375];
        },
      ],
      [0.06, (rng, i) => [cameraX(i % 4) + jitter(rng, 0.07), 2.0 + jitter(rng, 0.07), 0.6 + jitter(rng, 0.07)]],
      [
        0.18,
        (rng, i) => {
          const t = rng();
          const spread = t * 0.9;
          const a = rng() * TAU;
          return [cameraX(i % 4) + Math.cos(a) * spread, 2.0 - t * 3.6, 0.6 + Math.sin(a) * spread * 0.6 - t * 0.4];
        },
      ],
    ],
    (p) => {
      const [x, y, z] = rotate(p, 0.25, -0.3);
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

// Avatar Studio: a voice ring around a face-like orb.
function voice(count: number) {
  const bars = 72;
  return compose(
    count,
    9,
    [
      [
        0.62,
        (rng, i) => {
          const k = i % bars;
          const a = (k / bars) * TAU;
          const level = 0.25 + 0.95 * Math.abs(Math.sin(k * 0.37) * Math.cos(k * 0.11 + 1.3));
          const r = 1.35 + rng() * level;
          const w = jitter(rng, 0.025);
          return [Math.cos(a) * r - Math.sin(a) * w, Math.sin(a) * r + Math.cos(a) * w, jitter(rng, 0.04)];
        },
      ],
      [0.16, (rng) => ring(rng, 1.2, 0.015)],
      [
        0.22,
        (rng) => {
          const [x, y, z] = onSphere(rng, 0.95);
          return [x, y, z * 0.4];
        },
      ],
    ],
    (p) => rotate(p, 0.05, 0.2),
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
  store,
  crosshair,
  knot,
  database,
  hub,
  voice,
  lattice,
  galaxy,
};

export function buildShape(id: SceneId, count: number) {
  return BUILDERS[id](count);
}
