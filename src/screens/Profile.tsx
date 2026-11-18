import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { color, font } from '../theme';
import { useLayout } from '../layout';
import { settingList, toggleSetting, useSettings } from '../data/settings';
import { TopNav } from '../components/Chrome';
import { Focusable } from '../components/Focusable';
import { SectionHeading, ShowTitle, styles } from '../components/primitives';
import { Stack } from '../components/Stack';

const viewer = {
  id: 'viewer-0042',
  displayName: 'Mara Lind',
  email: 'mara.lind@nocturne.example',
};

function Row({ label, value }: { label: string; value: string }): React.JSX.Element {
  const L = useLayout();
  const fs = L.size(26);
  return (
    <Stack row gap={L.size(24)} style={{ justifyContent: 'space-between', paddingVertical: fs * 0.7, borderBottomWidth: 1, borderBottomColor: color.line }}>
      <Text style={{ fontFamily: font.body, fontSize: fs, color: color.lichen }}>{label}</Text>
      <Text style={{ flexShrink: 1, fontFamily: font.medium, fontSize: fs, color: color.bone, textAlign: 'right' }}>{value}</Text>
    </Stack>
  );
}

function Toggle({ on }: { on: boolean }): React.JSX.Element {
  const L = useLayout();
  const w = L.size(72);
  const h = w * 0.58;
  return (
    <View style={{ width: w, height: h, borderRadius: h, padding: h * 0.12, backgroundColor: on ? color.marigold : color.lineStrong, alignItems: on ? 'flex-end' : 'flex-start' }}>
      <View style={{ width: h * 0.76, height: h * 0.76, borderRadius: h, backgroundColor: on ? color.onMarigold : color.lichen }} />
    </View>
  );
}

export function Profile(): React.JSX.Element {
  const L = useLayout();
  const settings = useSettings();
  const fs = L.size(26);
  const card = { flex: 1, alignSelf: 'stretch', backgroundColor: color.surface, borderRadius: L.size(28), padding: L.size(40) } as const;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.ground }} contentContainerStyle={{ paddingBottom: L.size(120) }}>
      <TopNav active="profile" />
      <Stack gap={L.size(40)} style={{ paddingHorizontal: L.gutter }}>
        <ShowTitle size={L.size(120)} style={{ marginTop: L.size(30) }}>
          {viewer.displayName}
        </ShowTitle>

        <Stack row gap={L.size(40)} style={{ alignItems: 'flex-start' }}>
          <View style={card}>
            <SectionHeading size={L.size(32)} style={{ marginBottom: L.size(10) }}>Account</SectionHeading>
            <Row label="Plan" value="Nocturne Premium, 4K" />
            <Row label="Email" value={viewer.email} />
            <Row label="Profile ID" value={viewer.id} />
          </View>

          <View style={card}>
            <SectionHeading size={L.size(32)} style={{ marginBottom: L.size(10) }}>Playback</SectionHeading>
            {settingList.map((s) => (
              <Focusable
                key={s.id}
                accessibilityRole="switch"
                accessibilityState={{ checked: settings[s.id] }}
                accessibilityLabel={s.name}
                testID={`setting-${s.id}`}
                onPress={() => toggleSetting(s.id)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: fs * 0.8, paddingHorizontal: fs * 0.6, borderRadius: fs * 0.6, borderBottomWidth: 1, borderBottomColor: color.line }}
                focusStyle={[{ backgroundColor: color.raised }, styles.ring, { borderRadius: fs * 0.6 }]}
              >
                <View style={{ flex: 1, marginRight: L.size(24) }}>
                  <Text style={{ fontFamily: font.semibold, fontSize: fs, color: color.bone }}>{s.name}</Text>
                  <Text style={{ marginTop: L.size(4), fontFamily: font.body, fontSize: fs * 0.85, color: color.lichen }}>{s.detail}</Text>
                </View>
                <Toggle on={settings[s.id]} />
              </Focusable>
            ))}
          </View>
        </Stack>

        <Text style={{ fontFamily: font.body, fontSize: fs * 0.8, lineHeight: fs * 1.25, color: color.lichenDim }}>
          Nocturne TV is a fictional service, a sample app for VibeView. Its titles, people and artwork are invented; the artwork was generated for this app. Fonts: Bricolage Grotesque and Instrument Sans (SIL Open Font License).
        </Text>
      </Stack>
    </ScrollView>
  );
}
