import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * One 10-foot layout. Sizes are authored for a 1920-wide canvas and scaled to
 * the TV's viewport (Samsung and LG web apps run at 1920x1080; a desktop
 * browser window of any width shows the same layout, smaller).
 */
export interface Layout {
  width: number;
  height: number;
  /** A size in 1920-canvas units, scaled to this screen. */
  size: (v: number) => number;
  /** Horizontal page gutter. */
  gutter: number;
}

export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const scale = width / 1920;
    const size = (v: number) => Math.round(v * scale);
    return { width, height, size, gutter: size(96) };
  }, [width, height]);
}
