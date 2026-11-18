import { useSyncExternalStore } from 'react';

export type SettingId = 'autoplay' | 'subtitles' | 'previews';

export const settingList: Array<{ id: SettingId; name: string; detail: string }> = [
  { id: 'autoplay', name: 'Autoplay next episode', detail: 'Starts the next episode when one ends' },
  { id: 'subtitles', name: 'Subtitles on by default', detail: 'The player opens with subtitles showing' },
  { id: 'previews', name: 'Play previews while browsing', detail: 'Trailers play on the home screen' },
];

let settings: Record<SettingId, boolean> = { autoplay: true, subtitles: true, previews: false };
const listeners = new Set<() => void>();

export function toggleSetting(id: SettingId): void {
  settings = { ...settings, [id]: !settings[id] };
  console.log(`[settings] ${id} ${settings[id] ? 'on' : 'off'}`);
  for (const l of listeners) l();
}

export function useSettings(): Record<SettingId, boolean> {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => settings,
    () => settings,
  );
}
