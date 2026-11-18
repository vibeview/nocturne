// Remote control for Samsung and LG TVs. The arrow keys move the browser's own
// focus, so react-native-web's Pressable answers OK (Enter) as it does a
// keyboard, and @vibeview/tv-focus marks each focused element for VibeView.
import { getNextFocus } from '@bbc/tv-lrud-spatial';
import { clearFocused, setFocused } from '@vibeview/tv-focus';
import { dispatchBack, remoteKey } from './remote';

/** An open panel keeps focus inside itself (give its root this nativeID). */
export const MODAL_ID = 'tv-modal';

const ARROWS: Record<number, true> = { 37: true, 38: true, 39: true, 40: true };

// Samsung delivers media keys only once the app registers them.
const TIZEN_MEDIA_KEYS = ['MediaPlay', 'MediaPause', 'MediaPlayPause', 'MediaRewind', 'MediaFastForward', 'MediaStop'];

declare const tizen: { tvinputdevice?: { registerKeyBatch(keys: string[]): void } } | undefined;

let started = false;

function scope(): HTMLElement | undefined {
  return document.getElementById(MODAL_ID) ?? undefined;
}

/** Left and Right move the caret in a text field until it reaches an end. */
function caretCanMove(el: Element | null, keyCode: number): boolean {
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return false;
  if (keyCode !== 37 && keyCode !== 39) return false;
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  return keyCode === 37 ? end > 0 : start < el.value.length;
}

/**
 * Left and Right stay in the row: at the end of the top navigation, Right does
 * nothing rather than jump to a poster further down.
 */
function inRow(from: Element, to: Element, keyCode: number): boolean {
  if (keyCode !== 37 && keyCode !== 39) return true;
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  return b.top < a.bottom && b.bottom > a.top;
}

function onKeyDown(e: KeyboardEvent): void {
  if (remoteKey(e) === 'back') {
    // At the root, Back does nothing: a VibeView session keeps the app open,
    // and leaving would only relaunch it.
    e.preventDefault();
    dispatchBack();
    return;
  }
  if (!ARROWS[e.keyCode]) return;
  const current = document.activeElement;
  if (caretCanMove(current, e.keyCode)) return;
  e.preventDefault();
  const from = current && current !== document.body ? current : null;
  const next = from ? getNextFocus(from, e.keyCode, scope()) : focusFallback();
  if (next && from && !inRow(from, next, e.keyCode)) return;
  if (next) focusElement(next);
}

// react-native-web puts its own scrollTo({ x, y, animated }) on every
// ScrollView's node, which ignores the browser's { top, left, behavior }.
const nativeScrollTo = Element.prototype.scrollTo as (this: Element, to: ScrollToOptions) => void;
const scrollTo = (el: Element, to: ScrollToOptions) => nativeScrollTo.call(el, to);

function scrollable(el: Element, axis: 'x' | 'y'): boolean {
  const overflow = getComputedStyle(el)[axis === 'x' ? 'overflowX' : 'overflowY'];
  if (overflow !== 'auto' && overflow !== 'scroll') return false;
  return axis === 'x' ? el.scrollWidth > el.clientWidth : el.scrollHeight > el.clientHeight;
}

/**
 * Scrolls every container around `el` just enough to show it, with a margin,
 * in one smooth scroll each. Something that fits on the container's first
 * screen scrolls it all the way back, so a screen's header and hero, or a
 * rail's first card, are never left half cut off.
 */
function reveal(el: HTMLElement): void {
  for (let c = el.parentElement; c; c = c.parentElement) {
    const x = scrollable(c, 'x');
    const y = scrollable(c, 'y');
    if (!x && !y) continue;
    const box = c.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (x) {
      const margin = c.clientWidth * 0.05;
      const left = r.left - box.left + c.scrollLeft;
      const right = r.right - box.left + c.scrollLeft;
      let to = c.scrollLeft;
      if (right + margin <= c.clientWidth) to = 0;
      else if (left - margin < c.scrollLeft) to = left - margin;
      else if (right + margin > c.scrollLeft + c.clientWidth) to = right + margin - c.clientWidth;
      if (to !== c.scrollLeft) scrollTo(c, { left: Math.max(0, to), behavior: 'smooth' });
    }
    if (y) {
      const margin = c.clientHeight * 0.12;
      const top = r.top - box.top + c.scrollTop;
      const bottom = r.bottom - box.top + c.scrollTop;
      let to = c.scrollTop;
      if (bottom + margin <= c.clientHeight) to = 0;
      else if (top - margin < c.scrollTop) to = top - margin;
      else if (bottom + margin > c.scrollTop + c.clientHeight) to = bottom + margin - c.clientHeight;
      if (to !== c.scrollTop) scrollTo(c, { top: Math.max(0, to), behavior: 'smooth' });
    }
  }
}

/**
 * Moves focus to `el` and scrolls it into view. The browser's own scroll on
 * focus() is off (preventScroll): it snapped instantly and fought any smooth
 * scroll a screen started, so the page bounced. This is the one place that
 * scrolls for focus.
 */
export function focusElement(el: HTMLElement): void {
  el.focus({ preventScroll: true });
  reveal(el);
}

/**
 * Something to focus when nothing is: the screen's preferred element, then
 * the element with test id `hint` (e.g. the section's own tab), then the first.
 */
function focusFallback(hint?: string): HTMLElement | null {
  const root = scope() ?? document;
  return (
    root.querySelector<HTMLElement>('[data-tv-preferred="true"]') ??
    (hint ? root.querySelector<HTMLElement>(`[data-testid="${hint}"]`) : null) ??
    root.querySelector<HTMLElement>('[tabindex="0"], input, textarea')
  );
}

/** Puts focus back on the screen when a navigation or a closed panel dropped it. */
export function refocusIfLost(hint?: string): void {
  const active = document.activeElement;
  const modal = scope();
  if (active && active !== document.body && (!modal || modal.contains(active))) return;
  const el = focusFallback(hint);
  if (el) focusElement(el);
}

export function setupRemote(): void {
  if (started) return;
  started = true;
  try {
    if (typeof tizen !== 'undefined') tizen.tvinputdevice?.registerKeyBatch(TIZEN_MEDIA_KEYS);
  } catch (err) {
    console.warn('[remote] media keys not registered', err);
  }
  // Capture phase, so focus moves before a screen's own key handler runs.
  window.addEventListener('keydown', onKeyDown, true);
  // Every focus change, from the remote, the LG pointer or a screen taking
  // focus, is marked for VibeView.
  document.addEventListener('focusin', (e) => setFocused(e.target instanceof Element ? e.target : null));
  document.addEventListener('focusout', (e) => {
    if (!e.relatedTarget && e.target instanceof Element) clearFocused(e.target);
  });
  // Focusable draws its own ring, and a TV shows no scroll bars.
  const style = document.createElement('style');
  style.textContent = '*:focus { outline: none; } ::-webkit-scrollbar { display: none; }';
  document.head.appendChild(style);
}
