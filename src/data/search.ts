import { titles, type Title } from './catalog';

// Moods the search screen suggests, mapped to the titles they stand for.
const MOODS: Record<string, string[]> = {
  space: ['low-orbit', 'glasshouse', 'deep-time'],
  'night markets': ['kitchen-midnight', 'neon-saints'],
  jazz: ['velvet-hour', 'paper-moons'],
};

/** Titles matching a query by name, genre, kind, synopsis or mood. */
export function search(query: string): Title[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const tagged = MOODS[needle] ?? [];
  return titles.filter(
    (t) =>
      tagged.includes(t.id) ||
      t.name.toLowerCase().includes(needle) ||
      t.genre.toLowerCase().includes(needle) ||
      t.kind.includes(needle) ||
      t.synopsis.toLowerCase().includes(needle),
  );
}
