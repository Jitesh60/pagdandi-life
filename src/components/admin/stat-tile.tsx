/**
 * A headline figure. Not a chart: when the job is "one number", a tile reads
 * faster than any plot, so these carry no sparkline unless one adds meaning.
 */
export function StatTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="border border-line bg-paper px-5 py-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 font-display text-(length:--text-display-sm) tabular-nums">{value}</p>
      {detail && <p className="mt-1.5 text-[0.8125rem] text-ink-muted">{detail}</p>}
    </div>
  );
}
