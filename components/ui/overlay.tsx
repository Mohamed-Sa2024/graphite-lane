"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

/* ---------------------------------- Drawer --------------------------------- */

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  const mounted = useMounted();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            style={{ width }}
            className="relative flex h-full max-w-[92vw] flex-col border-l border-border bg-surface shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-fg">{title}</h2>
                {description && (
                  <p className="mt-0.5 text-xs text-muted">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && (
              <footer className="border-t border-border px-5 py-3.5">
                {footer}
              </footer>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ----------------------------------- Menu ---------------------------------- */

export function Menu({
  trigger,
  children,
  align = "start",
  className,
}: {
  trigger: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <span onClick={() => setOpen((o) => !o)}>{trigger}</span>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-xl",
              align === "end" ? "right-0" : "left-0",
              className,
            )}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
  active,
  destructive,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-surface-2",
        active && "text-primary",
        destructive ? "text-danger hover:bg-danger/10" : "text-fg",
      )}
    >
      {children}
    </button>
  );
}
