export const HERO_RETURN_EVENT = "portfolio:hero-return";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Smooth-scroll to a same-page #hash without leaving it in the URL.
 * Returns false when the href is not a same-page hash (caller should navigate normally).
 */
export function navigateToHash(href: string, instant = false): boolean {
  const url = new URL(href, window.location.href);
  if (url.origin !== location.origin || url.pathname !== "/" || location.pathname !== "/" || url.search !== location.search || !url.hash) return false;
  let id: string;
  try { id = decodeURIComponent(url.hash.slice(1)); } catch { return false; }
  const el = document.getElementById(id);
  if (!el) return false;
  if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
  if (id === "about") window.dispatchEvent(new Event(HERO_RETURN_EVENT));
  el.scrollIntoView({ behavior: instant || prefersReducedMotion() ? "instant" : "smooth", block: "start" });
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  return true;
}
