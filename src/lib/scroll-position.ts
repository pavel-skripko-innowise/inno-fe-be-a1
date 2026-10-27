import { useEffect } from "react";

/**
 * Remembers the reading position per page. The position is stored relative to the
 * nearest heading above the viewport top, so it stays correct even when content
 * above changes height (code highlighting, diagrams, images loading).
 */
const KEY = "scroll-positions";
const MAX_ENTRIES = 200;

interface Saved {
  anchor?: string; // heading id
  offset: number; // px from the anchor (or page top) to viewport top
  t: number;
}

function load(): Record<string, Saved> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function clearScrollPositions() {
  localStorage.removeItem(KEY);
}

function headings(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>("h1[id],h2[id],h3[id],h4[id]"));
}

function capture(root: HTMLElement): Saved {
  let anchor: HTMLElement | undefined;
  for (const h of headings(root)) {
    if (h.getBoundingClientRect().top <= 1) anchor = h;
    else break;
  }
  if (!anchor) return { offset: window.scrollY, t: Date.now() };
  return { anchor: anchor.id, offset: -anchor.getBoundingClientRect().top, t: Date.now() };
}

function targetY(s: Saved) {
  const el = s.anchor ? document.getElementById(s.anchor) : null;
  return el ? el.getBoundingClientRect().top + window.scrollY + s.offset : s.offset;
}

export function useScrollMemory(key: string, rootId: string, enabled: boolean) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!enabled || !root) return;

    // --- restore (skipped when the URL points at a specific #anchor) ---
    const saved = window.location.hash ? undefined : load()[key];
    let restoring = !!saved && (saved.anchor !== undefined || saved.offset > 0);
    const stop = () => (restoring = false);
    const apply = () => {
      if (restoring && saved) window.scrollTo({ top: targetY(saved), behavior: "instant" });
    };
    const ro = new ResizeObserver(apply); // re-apply while content settles
    if (restoring) {
      requestAnimationFrame(apply);
      ro.observe(root);
      ["wheel", "touchstart", "keydown", "mousedown"].forEach((e) =>
        window.addEventListener(e, stop, { passive: true, once: true }),
      );
    }
    const done = setTimeout(() => (stop(), ro.disconnect()), 2500);

    // --- save: capture on scroll (old DOM is gone by cleanup time), write throttled ---
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last: Saved | null | undefined; // undefined = nothing to write, null = at top
    const write = () => {
      if (last === undefined) return;
      const all = load();
      if (last === null) delete all[key];
      else all[key] = last;
      const entries = Object.entries(all).sort((a, b) => b[1].t - a[1].t).slice(0, MAX_ENTRIES);
      localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(entries)));
      last = undefined;
    };
    const onScroll = () => {
      if (restoring) return;
      last = window.scrollY < 50 ? null : capture(root);
      clearTimeout(timer);
      timer = setTimeout(write, 250);
    };
    const flush = () => {
      clearTimeout(timer);
      write();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", flush);

    return () => {
      flush(); // persist the last captured position when leaving the page
      clearTimeout(timer);
      clearTimeout(done);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", flush);
      ["wheel", "touchstart", "keydown", "mousedown"].forEach((e) => window.removeEventListener(e, stop));
    };
  }, [key, rootId, enabled]);
}
