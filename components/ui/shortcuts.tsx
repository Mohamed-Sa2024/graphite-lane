"use client";

import { createPortal } from "react-dom";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Kbd } from "./kit";

export interface Shortcut {
  keys: string[];
  label: string;
}

function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

export function ShortcutsOverlay({
  open,
  onClose,
  shortcuts,
}: {
  open: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
}) {
  const mounted = useMounted();
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.14 }}
            className="relative w-full max-w-sm overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-fg">
                Keyboard shortcuts
              </h2>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-fg"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="divide-y divide-border">
              {shortcuts.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <span className="text-sm text-fg">{s.label}</span>
                  <span className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <Kbd key={k}>{k}</Kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
