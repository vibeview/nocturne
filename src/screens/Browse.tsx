import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { color, font } from '../theme';
import { useLayout } from '../layout';
import { nav, type Section } from '../nav';
import { titles, type Kind, type Title } from '../data/catalog';
import { useSaved } from '../data/myList';
import { PosterCard } from '../components/Cards';
import { TopNav } from '../components/Chrome';
import { cardWidth } from '../components/Rail';
import { Button, ShowTitle } from '../components/primitives';
import { Grid, Stack } from '../components/Stack';

const heading: Partial<Record<Section, string>> = {
  series: 'Series',
  films: 'Films',
  documentaries: 'Documentaries',
  list: 'My list',
};

/** A poster grid: one kind of title, or the viewer's saved list. */
export function Browse({ section, kind }: { section: Section; kind?: Kind }): React.JSX.Element {
  const L = useLayout();
  const saved = useSaved();
  const items: Title[] = kind ? titles.filter((t) => t.kind === kind) : saved.map((id) => titles.find((t) => t.id === id)!).filter(Boolean);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.ground }} contentContainerStyle={{ paddingBottom: L.size(120) }}>
      <TopNav active={section} />
      <Stack gap={L.size(40)} style={{ paddingHorizontal: L.gutter }}>
        <ShowTitle size={L.size(120)} style={{ marginTop: L.size(30) }}>
          {heading[section] ?? ''}
        </ShowTitle>
        {items.length === 0 ? (
          <Stack gap={L.size(24)} style={{ alignItems: 'flex-start' }}>
            <Text style={{ fontFamily: font.body, fontSize: L.size(28), color: color.mist }}>
              Save shows here to find them again. Choose My list on any title.
            </Text>
            <Button kind="primary" label="Browse series" hasTVPreferredFocus onPress={() => nav.section('series')} />
          </Stack>
        ) : (
          <Grid gap={L.size(32)} style={{ paddingTop: L.size(20) }}>
            {items.map((t, i) => (
              <PosterCard key={t.id} title={t} width={cardWidth(L, 'poster')} hasTVPreferredFocus={i === 0} onPress={() => nav.push({ name: 'detail', id: t.id })} />
            ))}
          </Grid>
        )}
      </Stack>
    </ScrollView>
  );
}
