"use client";

import { useEffect, useRef } from "react";

/**
 * A modal dialog built on the native <dialog> element.
 *
 * Using the platform element rather than a div means focus trapping, Escape
 * handling, inert background content and top-layer stacking all come for free
 * and behave correctly with assistive technology. We add only the two things
 * it doesn't give us: closing on a backdrop click, and locking body scroll.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();

    // The page behind must not scroll while the dialog is up.
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // Fires for Escape as well as an explicit close(), so both route through onClose.
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  /** A click landing on the dialog itself — not its content — is the backdrop. */
  const onBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      onClick={onBackdropClick}
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
      // `m-auto` is required: a native dialog centres itself via `margin: auto`,
      // and Tailwind's preflight resets every element's margin to 0.
      className={`m-auto w-[calc(100vw-2rem)] bg-transparent p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] ${
        size === "lg" ? "max-w-3xl" : "max-w-xl"
      }`}
    >
      <div className="flex max-h-[85vh] flex-col border border-line bg-paper shadow-[0_24px_60px_-20px_rgb(28_27_24/0.28)]">
        <header className="flex items-start justify-between gap-6 border-b border-line-soft px-7 py-5">
          <div>
            <h2 id="modal-title" className="font-display text-(length:--text-display-sm)">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1.5 text-[0.8125rem] text-ink-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 shrink-0 px-2 py-1 text-[1.25rem] leading-none text-ink-muted transition-colors hover:text-ink"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">{children}</div>

        {footer && (
          <footer className="flex flex-wrap justify-end gap-3 border-t border-line-soft bg-paper-alt px-7 py-4">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
