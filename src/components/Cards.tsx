import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { color, font } from '../theme';
import { useLayout } from '../layout';
import type { Episode, Title } from '../data/catalog';
import { Focusable } from './Focusable';
import { Progress, styles } from './primitives';
import { Stack } from './Stack';

export interface CardProps {
  title: Title;
  width: number;
  onPress: () => void;
  onFocus?: () => void;
  hasTVPreferredFocus?: boolean;
}

export function PosterCard({ title, width, onPress, onFocus, hasTVPreferredFocus }: CardProps): React.JSX.Element {
  const L = useLayout();
  const radius = L.size(18);
  const label = L.size(24);
  return (
    <View style={{ width }}>
      <Focusable
        accessibilityRole="button"
        accessibilityLabel={title.name}
        testID={`poster-${title.id}`}
        onPress={onPress}
        onFocusChange={(f) => f && onFocus?.()}
        hasTVPreferredFocus={hasTVPreferredFocus}
        focusScale={1.06}
        // Height from width: CSS aspect-ratio needs Chrome 88 (LG webOS 6 is 79).
        style={{ width, height: width * 1.5, borderRadius: radius }}
        focusStyle={[styles.ring, { borderRadius: radius }]}
      >
        <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden', backgroundColor: color.surface }]}>
          <Image source={title.poster} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </View>
        {title.badge ? (
          <Text
            style={{
              position: 'absolute',
              top: radius * 0.6,
              left: radius * 0.6,
              fontFamily: font.semibold,
              fontSize: label * 0.72,
              color: color.onMarigold,
              backgroundColor: color.marigold,
              paddingHorizontal: label * 0.45,
              paddingVertical: label * 0.15,
              borderRadius: label,
              overflow: 'hidden',
            }}
          >
            {title.badge}
          </Text>
        ) : null}
      </Focusable>
    </View>
  );
}

export function LandscapeCard({ title, episode, width, onPress, onFocus, hasTVPreferredFocus }: CardProps & { episode?: Episode }): React.JSX.Element {
  const L = useLayout();
  const radius = L.size(18);
  const label = L.size(24);
  const sub = L.size(20);
  return (
    <Stack gap={L.size(14)} style={{ width }}>
      <Focusable
        accessibilityRole="button"
        accessibilityLabel={episode ? `${title.name}, episode ${episode.number}, ${episode.title}` : title.name}
        testID={`card-${title.id}`}
        onPress={onPress}
        onFocusChange={(f) => f && onFocus?.()}
        hasTVPreferredFocus={hasTVPreferredFocus}
        focusScale={1.05}
        style={{ width, height: (width * 9) / 16, borderRadius: radius }}
        focusStyle={[styles.ring, { borderRadius: radius }]}
      >
        <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden', backgroundColor: color.surface }]}>
          <Image source={title.still} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          {episode ? (
            <Progress value={episode.progress} height={L.size(6)} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} />
          ) : null}
        </View>
      </Focusable>
      <View>
        <Text numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: label, color: color.bone }}>
          {title.name}
        </Text>
        <Text numberOfLines={1} style={{ fontFamily: font.body, fontSize: sub, color: color.lichen }}>
          {episode ? `${title.kind === 'documentary' ? '' : 'S1 '}E${episode.number}  ${episode.title}` : title.genre}
        </Text>
      </View>
    </Stack>
  );
}

/** Poster with a large rank number beside it, for the Top 10 rail. */
export function RankedCard({ rank, ...props }: CardProps & { rank: number }): React.JSX.Element {
  const numberSize = props.width * 1.05;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={{
          fontFamily: font.title,
          fontSize: numberSize,
          lineHeight: numberSize * 0.86,
          color: color.lineStrong,
          // Tight digits for "10". A browser also applies letter-spacing after
          // the last digit, which would push the glyph out of its box and
          // under the poster: the padding gives that space back.
          letterSpacing: -numberSize * 0.08,
          paddingRight: numberSize * 0.08,
          minWidth: props.width * 0.42,
          textAlign: 'right',
          marginRight: props.width * 0.04,
        }}
      >
        {String(rank)}
      </Text>
      <PosterCard {...props} />
    </View>
  );
}
