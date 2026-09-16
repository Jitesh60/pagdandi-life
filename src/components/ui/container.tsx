/** Page gutter and max width, in one place so every section aligns. */
export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1400px] px-6 lg:px-10 ${className}`}>{children}</div>
  );
}

/** Small uppercase label that opens a section. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
