import React from 'react';
import { Text, View } from 'react-native';
import { color, font } from '../theme';
import { useLayout } from '../layout';
import { nav, type Section } from '../nav';
import { Focusable } from './Focusable';
import { Icon } from './Icon';
import { Wordmark, styles } from './primitives';
import { Stack } from './Stack';

const TOP: Array<{ section: Section; label: string }> = [
  { section: 'home', label: 'Home' },
  { section: 'series', label: 'Series' },
  { section: 'films', label: 'Films' },
  { section: 'documentaries', label: 'Documentaries' },
  { section: 'list', label: 'My list' },
];

/** Top navigation: sections, then Search and Profile on the right. */
export function TopNav({ active }: { active: Section }): React.JSX.Element {
  const L = useLayout();
  const fs = L.size(26);
  const round = L.size(60);
  return (
    <Stack
      row
      gap={L.size(56)}
      style={{
        alignItems: 'center',
        paddingHorizontal: L.gutter,
        paddingVertical: L.size(30),
        width: '100%',
      }}
    >
      <Wordmark size={L.size(38)} />
      <Stack row gap={L.size(8)} accessibilityRole="tablist">
        {TOP.map((item) => {
          const on = item.section === active;
          return (
            <Focusable
              key={item.section}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              testID={`nav-${item.section}`}
              onPress={() => nav.section(item.section)}
              style={{
                paddingHorizontal: fs * 0.85,
                paddingVertical: fs * 0.4,
                borderRadius: fs * 2,
                backgroundColor: on ? 'rgba(241,234,219,0.14)' : 'transparent',
              }}
              focusStyle={{ backgroundColor: color.bone }}
            >
              {({ focused }) => (
                <Text style={{ fontFamily: font.medium, fontSize: fs, color: focused ? color.ground : on ? color.bone : color.mist }}>
                  {item.label}
                </Text>
              )}
            </Focusable>
          );
        })}
      </Stack>
      <Stack row gap={L.size(24)} style={{ marginLeft: 'auto', alignItems: 'center' }}>
        <Focusable
          accessibilityRole="button"
          accessibilityLabel="Search"
          testID="nav-search"
          onPress={() => nav.section('search')}
          style={{ width: round, height: round, borderRadius: round, alignItems: 'center', justifyContent: 'center', backgroundColor: active === 'search' ? color.glassStrong : color.glass }}
          focusStyle={[styles.ring, { borderRadius: round }]}
        >
          <Icon name="search" size={round * 0.46} color={color.bone} />
        </Focusable>
        <Focusable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          testID="nav-profile"
          onPress={() => nav.section('profile')}
          style={{ width: round, height: round, borderRadius: round, alignItems: 'center', justifyContent: 'center', backgroundColor: color.lineStrong }}
          focusStyle={[styles.ring, { borderRadius: round }]}
        >
          <Text style={{ fontFamily: font.semibold, fontSize: round * 0.4, color: color.bone }}>M</Text>
        </Focusable>
      </Stack>
    </Stack>
  );
}
