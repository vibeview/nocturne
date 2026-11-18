import React, { memo, useCallback, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { color, font } from '../theme';
import { useLayout } from '../layout';
import { nav } from '../nav';
import { continueWatching, featured, rails, stillAspect, type Title } from '../data/catalog';
import { toggleSaved, useSaved } from '../data/myList';
import { Backdrop } from '../components/Backdrop';
import { LandscapeCard, PosterCard, RankedCard } from '../components/Cards';
import { TopNav } from '../components/Chrome';
import { Rail } from '../components/Rail';
import { Button, Meta, ShowTitle } from '../components/primitives';
import { Stack } from '../components/Stack';

function HeroText({ title }: { title: Title }): React.JSX.Element {
  const L = useLayout();
  const saved = useSaved().includes(title.id);
  const first = title.episodes[0];
  return (
    <Stack gap={L.size(24)} style={{ maxWidth: L.size(960) }}>
      <Text style={{ fontFamily: font.semibold, fontSize: L.size(24), color: color.marigold }}>{title.tagline}</Text>
      <ShowTitle size={L.size(150)}>{title.name}</ShowTitle>
      <Meta size={L.size(22)} rating={title.rating} items={[title.genre, title.extent]} />
      <Text
        numberOfLines={2}
        style={{ fontFamily: font.body, fontSize: L.size(27), lineHeight: L.size(39), color: color.boneSoft, maxWidth: L.size(900) }}
      >
        {title.synopsis}
      </Text>
      <Stack row gap={L.size(20)} style={{ marginTop: L.size(10) }}>
        <Button
          kind="primary"
          icon="play"
          label={!first ? 'Play' : title.kind === 'documentary' ? 'Play E1' : 'Play S1 E1'}
          testID="hero-play"
          hasTVPreferredFocus
          onPress={() => nav.push({ name: 'player', id: title.id, episode: first?.id })}
        />
        <Button
          icon={saved ? 'check' : 'plus'}
          testID="hero-my-list"
          label="My list"
          onPress={() => toggleSaved(title.id)}
        />
        <Button label="Details" testID="hero-details" onPress={() => nav.push({ name: 'detail', id: title.id })} />
      </Stack>
    </Stack>
  );
}

/**
 * Memoized: a new hero (every time focus settles on a title) re-renders the
 * hero and backdrop only, not every card on the page.
 */
const Rails = memo(function Rails({ onFocusTitle }: { onFocusTitle: (t: Title) => void }): React.JSX.Element {
  const L = useLayout();
  return (
    <Stack gap={L.size(40)}>
      <View>
        <Rail
          id="home-continue-watching"
          heading="Continue watching"
          shape="landscape"
          items={continueWatching}
          keyOf={(c) => c.title.id}
          render={(c, w) => (
            <LandscapeCard
              title={c.title}
              episode={c.episode}
              width={w}
              onFocus={() => onFocusTitle(c.title)}
              onPress={() => nav.push({ name: 'player', id: c.title.id, episode: c.episode.id })}
            />
          )}
        />
      </View>
      {rails.map((rail) => (
        <View key={rail.id}>
          <Rail
            id={`home-${rail.id}`}
            heading={rail.name}
            shape={rail.shape}
            items={rail.items}
            keyOf={(t) => t.id}
            render={(t, w, i) => {
              const props = { title: t, width: w, onFocus: () => onFocusTitle(t), onPress: () => nav.push({ name: 'detail', id: t.id }) };
              if (rail.shape === 'top10') return <RankedCard rank={i + 1} {...props} />;
              if (rail.shape === 'poster') return <PosterCard {...props} />;
              return <LandscapeCard {...props} />;
            }}
          />
        </View>
      ))}
    </Stack>
  );
});

export function Home(): React.JSX.Element {
  const L = useLayout();
  const [hero, setHero] = useState<Title>(featured[0]!);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The backdrop follows focus, after a short settle so fast scrolling doesn't
  // flicker through every title. Scrolling to the focused card is tv/focus.ts's.
  const focusTitle = useCallback((t: Title) => {
    if (pending.current) clearTimeout(pending.current);
    pending.current = setTimeout(() => setHero((h) => (h.id === t.id ? h : t)), 350);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: color.ground }}>
      <Backdrop source={hero.still} aspect={stillAspect(hero)} focusX={hero.focusX} bottomStart={0.35} />
      <ScrollView contentContainerStyle={{ paddingBottom: L.size(400) }}>
        <TopNav active="home" />
        <View style={{ height: L.height * 0.6, justifyContent: 'flex-end', paddingHorizontal: L.gutter, paddingBottom: L.size(40) }}>
          <HeroText title={hero} />
        </View>
        <Rails onFocusTitle={focusTitle} />
      </ScrollView>
    </View>
  );
}
