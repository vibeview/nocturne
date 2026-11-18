import { describe, expect, it } from 'vitest';
import { dispatchBack, onRemoteBack, remoteKey } from './remote';

describe('remoteKey', () => {
  it('reads Back on Samsung, LG and a desktop keyboard', () => {
    expect(remoteKey({ keyCode: 10009 })).toBe('back');
    expect(remoteKey({ keyCode: 461 })).toBe('back');
    expect(remoteKey({ keyCode: 27 })).toBe('back');
  });
  it('reads the media keys', () => {
    expect(remoteKey({ keyCode: 415 })).toBe('play');
    expect(remoteKey({ keyCode: 19 })).toBe('pause');
    expect(remoteKey({ keyCode: 10252 })).toBe('playPause');
    expect(remoteKey({ keyCode: 412 })).toBe('rewind');
    expect(remoteKey({ keyCode: 417 })).toBe('fastForward');
  });
  it('leaves the arrows, OK and typing alone', () => {
    for (const keyCode of [13, 37, 38, 39, 40, 8, 65]) expect(remoteKey({ keyCode })).toBeNull();
  });
});

describe('Back handlers', () => {
  it('asks the newest handler first and stops at the one that used the key', () => {
    const calls: string[] = [];
    const offScreen = onRemoteBack(() => (calls.push('screen'), true));
    const offPanel = onRemoteBack(() => (calls.push('panel'), true));
    expect(dispatchBack()).toBe(true);
    expect(calls).toEqual(['panel']);
    offPanel();
    expect(dispatchBack()).toBe(true);
    expect(calls).toEqual(['panel', 'screen']);
    offScreen();
  });
  it('falls through a handler that did not use the key', () => {
    const offRoot = onRemoteBack(() => true);
    const offNoop = onRemoteBack(() => false);
    expect(dispatchBack()).toBe(true);
    offNoop();
    offRoot();
    expect(dispatchBack()).toBe(false);
  });
});
