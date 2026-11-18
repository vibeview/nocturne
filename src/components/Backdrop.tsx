import React, { useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color } from '../theme';

// The fade-in is a CSS animation on its own GPU layer (translateZ), so a TV
// browser composites it instead of re-running script and repainting a
// full-screen image every frame. A new source remounts the layer (key), which
// restarts the animation.
// react-native-web compiles animationKeyframes only in StyleSheet.create.
const fadeIn = StyleSheet.create({
  layer: {
    animationKeyframes: [{ from: { opacity: 0 }, to: { opacity: 1 } }],
    animationDuration: '450ms',
    animationTimingFunction: 'ease-out',
    transform: 'translateZ(0)',
  } as unknown as ViewStyle,
}).layer;

/**
 * Full-bleed artwork with the scrims that keep text on top of it readable.
 * Fades in when the source changes. No endless motion: on a TV browser every
 * animated frame of a full-screen image costs the whole UI.
 */
export function Backdrop({ source, aspect = 1.5, focusX = 0.5, side = true, bottom = true, bottomStart = 0.45 }: {
  source: ImageSourcePropType;
  /** Width / height of the artwork. */
  aspect?: number;
  /** Horizontal position of the subject (0–1), kept in frame when cropping. */
  focusX?: number;
  side?: boolean;
  bottom?: boolean;
  /** Where the bottom scrim starts, as a fraction of height. */
  bottomStart?: number;
}): React.JSX.Element {
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Cover-fit by hand so the subject stays in frame.
  const wide = box.w / Math.max(1, box.h) > aspect;
  const iw = wide ? box.w : box.h * aspect;
  const ih = wide ? box.w / aspect : box.h;
  const left = Math.min(0, Math.max(box.w - iw, box.w / 2 - iw * focusX));
  const top = (box.h - ih) * 0.4;

  return (
    <View
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
      pointerEvents="none"
      onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {box.w > 0 ? (
        <View key={JSON.stringify(source)} style={[{ position: 'absolute', left, top, width: iw, height: ih }, fadeIn]}>
          <Image source={source} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
        </View>
      ) : null}
      {side ? (
        <LinearGradient
          colors={['rgba(14,27,25,0.94)', 'rgba(14,27,25,0.55)', 'rgba(14,27,25,0)']}
          locations={[0, 0.38, 0.66]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {bottom ? (
        <LinearGradient
          colors={['rgba(14,27,25,0)', color.ground]}
          locations={[bottomStart, 0.92]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </View>
  );
}
