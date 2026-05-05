"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  /** Sticky below the scroll area (e.g. action buttons). */
  footer?: React.ReactNode;
  className?: string;
  /** Content wrapper classes (scroll, padding). */
  contentClassName?: string;
  title?: string;
  description?: string;
};

export function Dialog({
  open,
  onOpenChange,
  children,
  footer,
  className,
  contentClassName,
  title,
  description,
}: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 max-h-[min(90vh,40rem)] w-[min(100vw-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#111113] p-0 text-white shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm open:flex open:flex-col",
        className,
      )}
      onClose={() => onOpenChange(false)}
      onCancel={(e) => {
        e.preventDefault();
        onOpenChange(false);
      }}
    >
      <div
        className={cn(
          "flex max-h-[min(90vh,40rem)] min-h-0 flex-col gap-4 overflow-hidden p-6",
          contentClassName,
        )}
      >
        {title ? (
          <div className="shrink-0 space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="text-sm text-zinc-400">{description}</p>
            ) : null}
          </div>
        ) : null}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          {children}
        </div>
        {footer ? <div className="shrink-0 border-t border-white/10 pt-4">{footer}</div> : null}
      </div>
    </dialog>
  );
}
