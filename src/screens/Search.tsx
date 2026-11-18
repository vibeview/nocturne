import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { color, font } from '../theme';
import { useLayout } from '../layout';
import { nav } from '../nav';
import { titles, type Title } from '../data/catalog';
import { search } from '../data/search';
import { PosterCard } from '../components/Cards';
import { TopNav } from '../components/Chrome';
import { Focusable } from '../components/Focusable';
import { cardWidth } from '../components/Rail';
import { Icon } from '../components/Icon';
import { ShowTitle } from '../components/primitives';
import { Grid, Stack } from '../components/Stack';

const SUGGESTIONS = ['mystery', 'nature', 'space', 'night markets', 'jazz'];

export function Search(): React.JSX.Element {
  const L = useLayout();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Title[] | null>(null);

  // Searches once typing pauses, so each remote keystroke doesn't redraw the grid.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }
    const t = setTimeout(() => {
      const found = search(q);
      console.log(`[search] "${q}": ${found.length} results`);
      setResults(found);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const fs = L.size(34);
  const shown = results ?? titles.slice(0, 8);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.ground }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: L.size(120) }}>
      <TopNav active="search" />
      <Stack gap={L.size(36)} style={{ paddingHorizontal: L.gutter }}>
        <ShowTitle size={L.size(120)} style={{ marginTop: L.size(30) }}>
          Search
        </ShowTitle>
        <Stack row gap={L.size(16)} style={{ alignItems: 'center', borderRadius: 999, backgroundColor: color.surface, borderWidth: 1, borderColor: color.lineStrong, paddingHorizontal: fs * 0.9, height: fs * 2.6 }}>
          <Icon name="search" size={fs} color={color.lichen} />
          <TextInput
            testID="search-input"
            accessibilityLabel="Search titles, genres and moods"
            value={query}
            onChangeText={setQuery}
            placeholder="Titles, genres, moods"
            placeholderTextColor={color.lichenDim}
            autoCorrect={false}
            returnKeyType="search"
            style={{ flex: 1, fontFamily: font.body, fontSize: fs, color: color.bone, height: '100%', outlineStyle: 'none' } as object}
          />
        </Stack>
        <Stack row gap={L.size(14)}>
          {SUGGESTIONS.map((s, i) => (
            <Focusable
              key={s}
              accessibilityRole="button"
              // The screen opens here, not on the field: focusing a field
              // opens the TV's on-screen keyboard.
              hasTVPreferredFocus={i === 0}
              testID={`suggestion-${s.replace(' ', '-')}`}
              onPress={() => setQuery(s)}
              style={{ paddingHorizontal: fs * 0.8, paddingVertical: fs * 0.35, borderRadius: 999, borderWidth: 1.5, borderColor: color.lineStrong }}
              focusStyle={{ backgroundColor: color.bone, borderColor: color.bone }}
            >
              {({ focused }) => <Text style={{ fontFamily: font.medium, fontSize: fs * 0.72, color: focused ? color.ground : color.mist }}>{s}</Text>}
            </Focusable>
          ))}
        </Stack>
        <Text testID="search-summary" style={{ fontFamily: font.heading, fontSize: L.size(30), color: color.bone }}>
          {results === null ? 'Popular right now' : results.length === 0 ? `Nothing matches "${query.trim()}". Try a genre, like mystery.` : `${results.length} ${results.length === 1 ? 'result' : 'results'}`}
        </Text>
        <Grid gap={L.size(32)} style={{ paddingTop: L.size(20) }}>
          {shown.map((t) => (
            <PosterCard key={t.id} title={t} width={cardWidth(L, 'poster')} onPress={() => nav.push({ name: 'detail', id: t.id })} />
          ))}
        </Grid>
      </Stack>
    </ScrollView>
  );
}
