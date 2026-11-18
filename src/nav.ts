import { useSyncExternalStore } from 'react';
import type { Kind } from './data/catalog';

// A small stack navigator: the app has a handful of screens, and a stack of
// route objects is all the remote's Back needs.

export type Section = 'home' | 'series' | 'films' | 'documentaries' | 'search' | 'list' | 'profile';

export type Route =
  | { name: 'section'; section: Section }
  | { name: 'detail'; id: string }
  | { name: 'player'; id: string; episode?: string };

export const sectionKind: Partial<Record<Section, Kind>> = {
  series: 'series',
  films: 'film',
  documentaries: 'documentary',
};

let stack: Route[] = [{ name: 'section', section: 'home' }];
const listeners = new Set<() => void>();

function describe(r: Route): string {
  return r.name === 'section' ? r.section : r.name === 'detail' ? `detail/${r.id}` : `player/${r.id}`;
}

function set(next: Route[]): void {
  stack = next;
  const top = next[next.length - 1]!;
  // Shows up in the app log VibeView records for each session and run.
  console.log(`[nav] ${describe(top)}`);
  for (const l of listeners) l();
}

export const nav = {
  push(route: Route): void {
    set([...stack, route]);
  },
  /** Switch top-level section, clearing anything above it. */
  section(section: Section): void {
    set([{ name: 'section', section }]);
  },
  back(): boolean {
    if (stack.length <= 1) return false;
    set(stack.slice(0, -1));
    return true;
  },
  depth(): number {
    return stack.length;
  },
};

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStack(): Route[] {
  return useSyncExternalStore(subscribe, () => stack, () => stack);
}

/** The section the user is in, even while a detail page sits on top. */
export function currentSection(s: Route[]): Section {
  const first = s[0];
  return first?.name === 'section' ? first.section : 'home';
}
