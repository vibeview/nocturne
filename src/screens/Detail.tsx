import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { color, font } from '../theme';
import { useLayout } from '../layout';
import { nav } from '../nav';
import { byId, formatMinutes, stillAspect, titles, type Episode, type Title } from '../data/catalog';
import { toggleSaved, useSaved } from '../data/myList';
import { Backdrop } from '../components/Backdrop';
import { PosterCard } from '../components/Cards';
import { Rail } from '../components/Rail';
import { Focusable } from '../components/Focusable';
import { Icon } from '../components/Icon';
import { Stack } from '../components/Stack';
import { Button, Meta, Progress, SectionHeading, ShowTitle, styles } from '../components/primitives';

function resumeTarget(title: Title): Episode | undefined {
  return title.episodes.find((e) => e.progress > 0 && e.progress < 1) ?? title.episodes[0];
}

function EpisodeCard({ title, ep, width, index }: { title: Title; ep: Episode; width: number; index: number }): React.JSX.Element {
  const L = useLayout();
  const radius = L.size(18);
  const fs = L.size(24);
  // Alternate artwork so neighbouring episodes don't share one frame.
  const art = index % 2 === 0 ? title.still : title.poster;
  return (
    <Stack gap={L.size(14)} style={{ width }}>
      <Focusable
        accessibilityRole="button"
        accessibilityLabel={`Episode ${ep.number}, ${ep.title}`}
        testID={`episode-${ep.number}`}
        onPress={() => nav.push({ name: 'player', id: title.id, episode: ep.id })}
        focusScale={1.05}
        style={{ width, height: (width * 9) / 16, borderRadius: radius }}
        focusStyle={[styles.ring, { borderRadius: radius }]}
      >
        <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden', backgroundColor: color.surface }]}>
          <Image source={art} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
          <Progress value={ep.progress} height={L.size(6)} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} />
        </View>
      </Focusable>
      <Stack row gap={L.size(12)} style={{ justifyContent: 'space-between' }}>
        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: font.semibold, fontSize: fs, color: color.bone }}>
          {ep.number}. {ep.title}
        </Text>
        <Text style={{ fontFamily: font.medium, fontSize: fs * 0.9, color: color.lichen }}>{formatMinutes(ep.length)}</Text>
      </Stack>
      <Text numberOfLines={2} style={{ fontFamily: font.body, fontSize: fs * 0.84, lineHeight: fs * 1.2, color: color.lichen }}>
        {ep.blurb}
      </Text>
    </Stack>
  );
}

export function Detail({ id }: { id: string }): React.JSX.Element {
  const title = byId(id);
  const L = useLayout();
  const saved = useSaved().includes(title.id);
  const target = resumeTarget(title);
  const resumeLabel = target ? (target.progress > 0 ? `Resume E${target.number}` : 'Play E1') : 'Play';
  const play = () => nav.push({ name: 'player', id: title.id, episode: target?.id });
  const count = `${title.episodes.length} episodes`;
  const items =
    title.kind === 'film'
      ? [title.genre, title.extent]
      : title.extent.includes('episode')
        ? [title.genre, count]
        : [title.genre, title.extent, count];

  const buttons = (
    <Stack row gap={L.size(20)}>
      <Button kind="primary" icon="play" label={resumeLabel} onPress={play} hasTVPreferredFocus testID="detail-play" />
      <Button
        icon={saved ? 'check' : 'plus'}
        testID="detail-my-list"
        label={saved ? 'In My list' : 'My list'}
        accessibilityLabel={saved ? 'Remove from My list' : 'Add to My list'}
        onPress={() => toggleSaved(title.id)}
      />
    </Stack>
  );

  const episodesHeading = title.kind === 'film' ? 'Episodes' : 'Season 1';
  const similar = titles
    .filter((t) => t.id !== title.id && (t.kind === title.kind || t.genre === title.genre))
    .slice(0, 10);
  const moreLikeThis = (
    <View style={{ marginTop: L.size(72) }}>
      <Rail
        id={`detail-${title.id}-similar`}
        heading="More like this"
        shape="poster"
        items={similar}
        keyOf={(t) => t.id}
        render={(t, w) => <PosterCard title={t} width={w} onPress={() => nav.push({ name: 'detail', id: t.id })} />}
      />
    </View>
  );

  const epWidth = L.size(420);

  return (
    <View style={{ flex: 1, backgroundColor: color.ground }}>
      <View style={{ position: 'absolute', top: 0, right: 0, width: '74%', height: '80%' }}>
        <Backdrop source={title.still} aspect={stillAspect(title)} focusX={title.focusX} bottomStart={0.4} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: L.size(80) }}>
        <View style={{ paddingHorizontal: L.gutter }}>
          <View style={{ paddingTop: L.size(56) }}>
            <Focusable
              accessibilityRole="button"
              accessibilityLabel="Back"
              testID="detail-back"
              onPress={() => nav.back()}
              containerStyle={{ alignSelf: 'flex-start' }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: L.size(10), paddingRight: L.size(18), paddingLeft: L.size(8), borderRadius: 999 }}
              focusStyle={{ backgroundColor: color.glass }}
            >
              <Icon name="back" size={L.size(28)} color={color.lichen} />
              <Text style={{ marginLeft: L.size(10), fontFamily: font.medium, fontSize: L.size(22), color: color.lichen }}>
                {title.kind === 'documentary' ? 'Documentaries' : title.kind === 'film' ? 'Films' : 'Series'}
              </Text>
            </Focusable>
          </View>
          <Stack gap={L.size(24)} style={{ marginTop: L.size(60), maxWidth: L.size(820) }}>
            <ShowTitle size={L.size(150)}>{title.name}</ShowTitle>
            <Meta size={L.size(22)} rating={title.rating} items={items} />
            <Text style={{ fontFamily: font.body, fontSize: L.size(26), lineHeight: L.size(38), color: color.boneSoft }}>
              {title.synopsis}
            </Text>
            <View style={{ marginTop: L.size(8) }}>{buttons}</View>
          </Stack>
          {title.episodes.length > 0 ? (
            <Stack gap={L.size(24)} style={{ marginTop: L.size(80) }}>
              <SectionHeading size={L.size(32)}>{episodesHeading}</SectionHeading>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -L.gutter }} contentContainerStyle={{ paddingHorizontal: L.gutter, paddingVertical: L.size(20) }}>
                <Stack row gap={L.size(32)}>
                  {title.episodes.map((ep, i) => (
                    <EpisodeCard key={ep.id} title={title} ep={ep} width={epWidth} index={i} />
                  ))}
                </Stack>
              </ScrollView>
            </Stack>
          ) : null}
        </View>
        {moreLikeThis}
      </ScrollView>
    </View>
  );
}
