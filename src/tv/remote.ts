// Remote buttons and Back. Pure (no DOM, no React Native), so it is unit tested.

export type RemoteKey = 'back' | 'play' | 'pause' | 'playPause' | 'rewind' | 'fastForward' | 'stop';

/**
 * Remote buttons as browser key codes. Samsung and LG send the same media
 * codes; Back differs (Samsung 10009, LG 461). Escape stands in for Back in a
 * desktop browser. Pure, so it is testable without a TV.
 */
export function remoteKey(e: { keyCode: number; key?: string }): RemoteKey | null {
  switch (e.keyCode) {
    case 10009: // Samsung Return
    case 461: // LG Back
    case 27: // Escape (desktop)
      return 'back';
    case 415:
      return 'play';
    case 19:
      return 'pause';
    case 10252: // Samsung MediaPlayPause
      return 'playPause';
    case 412:
      return 'rewind';
    case 417:
      return 'fastForward';
    case 413:
      return 'stop';
    default:
      return null;
  }
}

type BackHandler = () => boolean;
const backHandlers: BackHandler[] = [];

/**
 * Back on a TV remote, newest handler first (an open panel closes before the
 * screen underneath goes back). A handler returns true when it used the key.
 * Native platforms keep React Native's BackHandler and TVEventHandler.
 */
export function onRemoteBack(handler: BackHandler): () => void {
  backHandlers.push(handler);
  return () => {
    const i = backHandlers.lastIndexOf(handler);
    if (i >= 0) backHandlers.splice(i, 1);
  };
}

/** Runs the Back handlers, newest first, until one uses the key. */
export function dispatchBack(): boolean {
  for (let i = backHandlers.length - 1; i >= 0; i--) {
    if (backHandlers[i]!()) return true;
  }
  return false;
}
