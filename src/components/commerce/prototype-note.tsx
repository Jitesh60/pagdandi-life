/**
 * Marks screens whose behaviour is simulated in the browser.
 *
 * The shop should never mistake a mocked checkout or dashboard for a working
 * one, so every such screen says so plainly rather than in a caption.
 */
export function PrototypeNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-(--radius-subtle) border border-line bg-paper-alt px-5 py-4 text-[0.8125rem] text-ink-muted">
      <strong className="font-medium text-ink">Prototype:</strong> {children}
    </p>
  );
}
