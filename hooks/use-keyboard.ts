"use client";

import * as React from "react";

type Handler = (e: KeyboardEvent) => void;

/**
 * Bind single-key shortcuts on the window. Shortcuts are ignored while the user
 * is typing in an input/textarea/select/contenteditable (except Escape), and
 * when a modifier key is held, so they never fight with the browser or forms.
 */
export function useKeyboardShortcuts(
  handlers: Record<string, Handler>,
  enabled = true,
) {
  // Keep the latest handlers without re-binding the listener every render.
  const ref = React.useRef(handlers);
  ref.current = handlers;

  React.useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      const editable =
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);
      if (editable && e.key !== "Escape") return;
      const handler = ref.current[e.key];
      if (handler) {
        e.preventDefault();
        handler(e);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
