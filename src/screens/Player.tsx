import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font } from '../theme';
import { useLayout } from '../layout';
import { remoteKey } from '../tv/remote';
import { nav } from '../nav';
import { byId, type Caption } from '../data/catalog';
import { useSettings } from '../data/settings';
import { Focusable } from '../components/Focusable';
import { Icon, type IconName } from '../components/Icon';
import { styles } from '../components/primitives';
import { Stack } from '../components/Stack';

// The clips are ~23 s loops. The player presents them inside the episode's
// real running time, starting where the viewer left off, so the UI reads like
// a full episode while the app stays small.

const CLIP_SECONDS = 23;
const CONTROLS_HIDE_MS = 5000;

function clock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}

function cueAt(captions: Caption[], t: number): Caption | undefined {
  return captions.find((c) => t >= c.start && t < c.end);
}

export function Player({ id, episode }: { id: string; episode?: string }): React.JSX.Element {
  const title = byId(id);
  const ep = title.episodes.find((e) => e.id === episode) ?? title.episodes[0];
  const L = useLayout();
  const settings = useSettings();

  const total = (ep?.length ?? 104) * 60;
  const startAt = Math.floor((ep && ep.progress < 1 ? ep.progress : 0) * total);

  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(settings.subtitles);
  const [controls, setControls] = useState(true);
  const lastClipTime = useRef(0);
  const startedRef = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const player = useVideoPlayer(title.clip, (p) => {
    p.loop = true;
    p.muted = true;
    p.timeUpdateEventInterval = 0.25;
    p.play();
  });

  useEffect(() => {
    const onReady = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      // A play() issued before the source loaded can be dropped.
      player.play();
      setReady(true);
    };
    const subs = [
      player.addListener('timeUpdate', ({ currentTime }) => {
        const prev = lastClipTime.current;
        const delta = currentTime >= prev ? currentTime - prev : CLIP_SECONDS - prev + currentTime;
        lastClipTime.current = currentTime;
        if (delta > 0 && delta < 2) setElapsed((e) => e + delta);
      }),
      player.addListener('statusChange', ({ status, error }) => {
        if (status === 'readyToPlay') onReady();
        if (status === 'error') console.error('[player] playback error', error);
      }),
      player.addListener('playingChange', ({ isPlaying }) => {
        setPlaying(isPlaying);
        console.log(`[player] ${isPlaying ? 'play' : 'pause'} at ${clock(startAt + lastClipTime.current)}`);
      }),
    ];
    if (player.status === 'readyToPlay') onReady();
    console.log(`[player] open ${title.id}${ep ? ` E${ep.number}` : ''} at ${clock(startAt)} of ${clock(total)}`);
    return () => subs.forEach((s) => s.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  /** Shows the controls, and hides them again after a few idle seconds. */
  const poke = useCallback(() => {
    setControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControls(false), CONTROLS_HIDE_MS);
  }, []);

  useEffect(() => {
    poke();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [poke]);

  const toggle = useCallback(() => {
    if (player.playing) player.pause();
    else player.play();
    poke();
  }, [player, poke]);

  const skip = useCallback(
    (sec: number) => {
      player.seekBy(sec);
      setElapsed((e) => Math.max(-startAt, e + sec));
      console.log(`[player] seek ${sec > 0 ? '+' : ''}${sec} s`);
      poke();
    },
    [player, poke, startAt],
  );

  // The arrows move focus between the controls; the media keys drive playback
  // and any other key shows the controls. Play toggles: VibeView's play/pause
  // button sends Play on both TVs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = remoteKey(e);
      if (k === 'back') return;
      if (k === 'play' || k === 'playPause') toggle();
      else if (k === 'pause') {
        if (player.playing) toggle();
        else poke();
      } else if (k === 'rewind') skip(-10);
      else if (k === 'fastForward') skip(10);
      else poke();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [player, toggle, skip, poke]);

  const position = Math.min(total, startAt + elapsed);
  const cue = captionsOn ? cueAt(title.captions, lastClipTime.current) : undefined;
  const fs = L.size(24);
  const titleSize = L.size(34);
  const btn = L.size(76);

  return (
    <Pressable
      accessibilityLabel="Video player"
      // Not a focus stop itself: the remote moves between the controls.
      tabIndex={-1}
      onPress={poke}
      onHoverIn={poke}
      style={{ flex: 1, backgroundColor: '#000' }}
    >
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
        <VideoView
          player={player}
          nativeControls={false}
          contentFit="cover"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />
        {cue ? (
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: controls ? L.size(300) : L.size(110), alignItems: 'center', paddingHorizontal: L.size(48) }}>
            <Text
              testID="caption"
              style={{ fontFamily: font.medium, fontSize: L.size(40), lineHeight: L.size(52), color: '#fff', backgroundColor: 'rgba(0,0,0,0.72)', paddingHorizontal: L.size(20), paddingVertical: L.size(4), borderRadius: L.size(8), overflow: 'hidden', textAlign: 'center' }}
            >
              {cue.text}
            </Text>
          </View>
        ) : null}
      </View>

      {!ready ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={color.marigold} />
        </View>
      ) : null}

      {controls ? (
        <>
          <View pointerEvents="box-none" style={{ position: 'absolute', top: L.size(56), left: L.gutter, right: L.gutter, flexDirection: 'row', alignItems: 'center' }}>
            <Focusable
              accessibilityRole="button"
              accessibilityLabel="Back"
              testID="player-back"
              onPress={() => nav.back()}
              style={{ width: btn, height: btn, borderRadius: btn, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}
              focusStyle={[styles.ring, { borderRadius: btn }]}
            >
              <Icon name="back" size={btn * 0.42} color={color.bone} weight={2.2} />
            </Focusable>
          </View>

          <Stack
            gap={L.size(22)}
            pointerEvents="box-none"
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: L.gutter, paddingBottom: L.size(64), paddingTop: L.size(120) }}
          >
            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none" />
            <Stack row gap={L.size(24)} style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <Stack gap={L.size(6)} style={{ flexShrink: 1 }}>
                <Text numberOfLines={1} testID="player-title" style={{ fontFamily: font.brand, fontSize: titleSize, color: color.bone, letterSpacing: -titleSize * 0.02 }}>
                  {title.name}
                </Text>
                {ep ? (
                  <Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: fs, color: color.mist }}>
                    {title.kind === 'documentary' ? '' : 'S1 '}E{ep.number}  {ep.title}
                  </Text>
                ) : null}
              </Stack>
              <Text style={{ fontFamily: font.medium, fontSize: fs, color: color.mist }} testID="player-time">
                {clock(position)} / {clock(total)}
              </Text>
            </Stack>
            <View style={{ height: L.size(8), borderRadius: 99, backgroundColor: 'rgba(241,234,219,0.28)' }}>
              <View style={{ height: '100%', width: `${(position / total) * 100}%`, borderRadius: 99, backgroundColor: color.marigold }} />
            </View>
            <Stack row gap={L.size(20)} style={{ alignItems: 'center' }}>
              <ControlButton icon="rewind" label="Back 10 seconds" testID="player-rewind" size={btn} onPress={() => skip(-10)} />
              <ControlButton icon={playing ? 'pause' : 'play'} label={playing ? 'Pause' : 'Play'} testID="player-play-pause" size={btn} onPress={toggle} primary preferred />
              <ControlButton icon="forward" label="Forward 10 seconds" testID="player-forward" size={btn} onPress={() => skip(10)} />
              <ControlButton icon="captions" label={captionsOn ? 'Turn subtitles off' : 'Turn subtitles on'} testID="player-subtitles" size={btn} onPress={() => setCaptionsOn((c) => !c)} active={captionsOn} />
            </Stack>
          </Stack>
        </>
      ) : null}
    </Pressable>
  );
}

function ControlButton({ icon, label, testID, size, onPress, primary, preferred, active }: {
  icon: IconName;
  label: string;
  testID: string;
  size: number;
  onPress: () => void;
  primary?: boolean;
  preferred?: boolean;
  active?: boolean;
}): React.JSX.Element {
  return (
    <Focusable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      hasTVPreferredFocus={preferred}
      onPress={onPress}
      focusScale={1.08}
      style={{
        width: size,
        height: size,
        borderRadius: size,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: primary ? color.marigold : active ? color.glassStrong : color.glass,
      }}
      focusStyle={[styles.ring, { borderRadius: size }]}
    >
      <Icon name={icon} size={size * 0.44} color={primary ? color.onMarigold : color.bone} weight={2.2} />
    </Focusable>
  );
}
