"use client";

import { useState } from "react";

export type BarDatum = {
  label: string;
  value: number;
  /** Optional override for reserved status colours, e.g. cancelled. */
  tone?: "negative";
};

/**
 * Horizontal bars for one measure across categories.
 *
 * Single hue by design — the bars encode magnitude, not identity, so a
 * categorical palette would imply a distinction that isn't there. Every bar is
 * directly labelled, which means identity never rests on colour.
 */
export function BarList({
  data,
  title,
  format,
}: {
  data: BarDatum[];
  title: string;
  format: (value: number) => string;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <figure className="border border-line bg-paper p-5">
      <figcaption className="text-[0.9375rem]">{title}</figcaption>

      <ul className="mt-5 flex flex-col gap-3.5">
        {data.map((datum) => {
          const pct = (datum.value / max) * 100;
          // Colour encodes MAGNITUDE, not row position: on a sequential ramp
          // the largest value must be the darkest. Tying it to index made the
          // biggest bar the palest and effectively invisible.
          // Floored at step 3 so no bar disappears against the track.
          const level = 3 + Math.round((datum.value / max) * 3);
          const step =
            datum.tone === "negative"
              ? "var(--color-chart-negative)"
              : `var(--color-chart-${Math.min(6, level)})`;

          return (
            <li
              key={datum.label}
              onPointerEnter={() => setHover(datum.label)}
              onPointerLeave={() => setHover(null)}
            >
              <div className="flex items-baseline justify-between gap-4 text-[0.8125rem]">
                <span className={hover === datum.label ? "text-ink" : "text-ink-muted"}>
                  {datum.label}
                </span>
                <span className="tabular-nums text-ink">{format(datum.value)}</span>
              </div>
              <div className="mt-1.5 h-2.5 w-full bg-paper-deep">
                <div
                  className="h-full rounded-r-[4px] transition-[width] duration-700 ease-[var(--ease-calm)]"
                  style={{ width: `${Math.max(pct, 1.5)}%`, backgroundColor: step }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
