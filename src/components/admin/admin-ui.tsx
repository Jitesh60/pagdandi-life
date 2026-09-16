"use client";

import { useState } from "react";

/** Page heading shared by every dashboard screen. */
export function AdminHeading({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="font-display text-(length:--text-display-md)">{title}</h1>
        {detail && <p className="mt-2 text-[0.875rem] text-ink-muted">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

/** Horizontally scrollable table wrapper — dashboards are wide on phones. */
export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-[0.875rem]">{children}</table>
    </div>
  );
}

export function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      scope="col"
      className={`border-b border-line px-3 py-2.5 font-medium text-ink-muted ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className = "",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td
      className={`border-b border-line-soft px-3 py-3 align-middle ${
        align === "right" ? "text-right tabular-nums" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}

/** Small state pill. Always paired with its label text, never colour alone. */
export function StatusPill({ status }: { status: string }) {
  const negative = ["cancelled", "overdue"].includes(status);
  const attention = ["pending", "requested"].includes(status);
  return (
    <span
      className={`inline-block border px-2.5 py-1 text-[0.75rem] capitalize ${
        negative
          ? "border-clay text-clay"
          : attention
            ? "border-ink text-ink"
            : "border-line text-ink-muted"
      }`}
    >
      {status}
    </span>
  );
}

/** Filter chips shared by the orders and rentals screens. */
export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={`border px-3.5 py-1.5 text-[0.8125rem] capitalize transition-colors ${
            value === option
              ? "border-ink bg-ink text-paper"
              : "border-line text-ink-muted hover:border-ink hover:text-ink"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/** Inline editable number, used for stock and price edits. */
export function InlineNumber({
  value,
  onCommit,
  prefix = "",
}: {
  value: number;
  onCommit: (value: number) => void;
  prefix?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(String(value));
          setEditing(true);
        }}
        className="border-b border-dashed border-line-soft tabular-nums transition-colors hover:border-ink"
      >
        {prefix}
        {value}
      </button>
    );
  }

  const commit = () => {
    const next = Number(draft);
    if (Number.isFinite(next) && next >= 0) onCommit(next);
    setEditing(false);
  };

  return (
    <input
      autoFocus
      value={draft}
      inputMode="numeric"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit();
        if (event.key === "Escape") setEditing(false);
      }}
      className="w-20 border-b border-ink bg-transparent text-right tabular-nums outline-none"
    />
  );
}
