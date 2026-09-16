"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/catalog/types";

export type TimePoint = { label: string; value: number };

const W = 760;
const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 56 };

/**
 * Revenue over time — one measure, so one series and one colour, with the
 * title carrying identity instead of a legend box.
 *
 * A crosshair and tooltip are standard rather than optional: an SVG chart in a
 * browser is interactive, and reading an exact week off a line otherwise means
 * guessing against the gridlines.
 */
export function RevenueChart({
  points,
  title,
}: {
  points: TimePoint[];
  title: string;
}) {
  const [active, setActive] = useState<number | null>(null);

  if (points.length === 0) return null;

  const max = Math.max(...points.map((p) => p.value), 1);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (i: number) => PAD.left + (i / Math.max(1, points.length - 1)) * plotW;
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${PAD.top + plotH} L${x(0)},${PAD.top + plotH} Z`;

  // Four recessive gridlines are enough to judge magnitude against.
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);

  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.left) / plotW) * (points.length - 1));
    setActive(Math.min(points.length - 1, Math.max(0, i)));
  };

  const point = active === null ? null : points[active];

  return (
    <figure className="border border-line bg-paper p-5">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-[0.9375rem]">{title}</h3>
        <p className="text-[0.8125rem] text-ink-muted tabular-nums" aria-live="polite">
          {point ? `${point.label} · ${formatPrice(point.value)}` : "Hover for a week"}
        </p>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full touch-none"
        role="img"
        aria-label={`${title}. ${points.length} weeks, peak ${formatPrice(max)}.`}
        onPointerMove={onMove}
        onPointerLeave={() => setActive(null)}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--color-chart-grid)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 10}
              y={y(tick) + 4}
              textAnchor="end"
              className="fill-ink-faint text-[10px] tabular-nums"
            >
              {Math.round(tick / 100000)}k
            </text>
          </g>
        ))}

        <path d={area} fill="var(--color-chart-1)" opacity="0.65" />
        <path
          d={line}
          fill="none"
          stroke="var(--color-chart-6)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) =>
          i % 2 === 0 ? (
            <text
              key={p.label}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-ink-faint text-[10px]"
            >
              {p.label}
            </text>
          ) : null,
        )}

        {active !== null && point && (
          <g>
            <line
              x1={x(active)}
              x2={x(active)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="var(--color-chart-5)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* A 2px surface ring keeps the marker legible over the area fill. */}
            <circle cx={x(active)} cy={y(point.value)} r="6" fill="var(--color-paper)" />
            <circle cx={x(active)} cy={y(point.value)} r="4.5" fill="var(--color-chart-6)" />
          </g>
        )}
      </svg>
    </figure>
  );
}
