"use client";

/**
 * Form controls for the dashboard.
 *
 * The storefront uses bare underlined inputs, which suits an editorial page
 * but reads as unfinished inside a dialog. These are properly bordered fields
 * with a visible focus state, which is what a data-entry form wants.
 */

const CONTROL =
  "mt-2 w-full border border-line bg-paper px-3.5 py-2.5 text-[0.9375rem] outline-none transition-colors placeholder:text-ink-faint focus:border-ink focus:ring-2 focus:ring-moss/20";

export function FieldLabel({ htmlFor, children, hint }: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="eyebrow">{children}</span>
      {hint && <span className="ml-2 text-[0.75rem] normal-case tracking-normal text-ink-faint">{hint}</span>}
    </label>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  hint,
  placeholder,
  inputMode,
  prefix,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  inputMode?: "numeric" | "tel";
  /** Rendered inside the control, e.g. a currency symbol. */
  prefix?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} hint={hint}>
        {label}
      </FieldLabel>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-ink-muted">
            {prefix}
          </span>
        )}
        <input
          id={id}
          value={value}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${CONTROL} ${prefix ? "pl-8" : ""}`}
        />
      </div>
    </div>
  );
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={CONTROL}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TextArea({
  id,
  label,
  value,
  onChange,
  rows = 3,
  hint,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id} hint={hint}>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${CONTROL} resize-y`}
      />
    </div>
  );
}

/** Inline validation summary, announced to assistive technology. */
export function FormErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <p role="alert" className="mt-5 border-l-2 border-clay bg-clay/6 px-4 py-3 text-[0.875rem] text-clay">
      Please add {errors.join(", ")}.
    </p>
  );
}
