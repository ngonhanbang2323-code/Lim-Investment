// Tree growth rings for the home hero. Each ring is a year; uneven widths read as good and
// lean years. Paths are deterministic so server and client render identically.

const RINGS = 15;
const POINTS = 96;

function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function ringPath(i: number, cx: number, cy: number) {
  // Cumulative radius with irregular yearly growth.
  let radius = 10;
  for (let k = 1; k <= i; k++) radius += 9 + seeded(k) * 13;
  const phase1 = seeded(i + 40) * Math.PI * 2;
  const phase2 = seeded(i + 80) * Math.PI * 2;
  // Growth drifts off-centre over the years, like a real trunk.
  const ox = cx + i * 1.1;
  const oy = cy - i * 0.7;

  const pts: [number, number][] = [];
  for (let p = 0; p < POINTS; p++) {
    const t = (p / POINTS) * Math.PI * 2;
    const wobble = 1 + 0.035 * Math.sin(3 * t + phase1) + 0.02 * Math.sin(7 * t + phase2) + 0.05 * Math.cos(t - 0.6) * (i / RINGS);
    pts.push([ox + radius * wobble * Math.cos(t), oy + radius * wobble * Math.sin(t)]);
  }
  let length = 0;
  pts.forEach(([x, y], p) => {
    const [nx, ny] = pts[(p + 1) % POINTS];
    length += Math.hypot(nx - x, ny - y);
  });
  const d = pts.map(([x, y], p) => `${p ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("") + "Z";
  return { d, length: Math.ceil(length) };
}

/** Pass no label when the rings are purely decorative. */
export function GrowthRings({ label, className = "" }: { label?: string; className?: string }) {
  const rings = Array.from({ length: RINGS }, (_, i) => ringPath(i, 250, 250));
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <svg viewBox="0 0 500 500" className={className} {...a11y}>
      {rings.map((r, i) => (
        <path
          key={i}
          d={r.d}
          className="ring"
          fill="none"
          stroke="currentColor"
          strokeWidth={i % 4 === 3 ? 2.2 : 1.1}
          strokeOpacity={0.35 + (i / RINGS) * 0.5}
          style={{ ["--len" as string]: r.length, ["--delay" as string]: `${i * 70}ms` }}
        />
      ))}
      <circle cx="250" cy="250" r="4" fill="currentColor" />
    </svg>
  );
}
