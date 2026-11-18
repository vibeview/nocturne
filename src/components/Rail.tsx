import React from 'react';
import { ScrollView, View } from 'react-native';
import { useLayout } from '../layout';
import { SectionHeading } from './primitives';
import { Stack } from './Stack';

export type Shape = 'poster' | 'landscape' | 'top10';

/** Card width inside a rail or a grid. */
export function cardWidth(L: ReturnType<typeof useLayout>, shape: Shape): number {
  return shape === 'landscape' ? L.size(400) : L.size(260);
}

/**
 * A titled horizontal strip of cards. The remote scrolls it: moving focus to a
 * card brings the card into view.
 */
export function Rail<T>({ id, heading, items, shape, render, keyOf }: {
  id: string;
  heading: string;
  items: T[];
  shape: Shape;
  render: (item: T, width: number, index: number) => React.ReactNode;
  keyOf: (item: T) => string;
}): React.JSX.Element {
  const L = useLayout();
  const width = cardWidth(L, shape);
  // Room above and below so a focused, scaled card is not clipped.
  const focusRoom = L.size(24);
  return (
    <Stack gap={L.size(6)}>
      <View style={{ paddingHorizontal: L.gutter }}>
        <SectionHeading size={L.size(32)}>{heading}</SectionHeading>
      </View>
      <ScrollView
        testID={`rail-${id}`}
        accessibilityLabel={heading}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: L.gutter, paddingVertical: focusRoom }}
      >
        <Stack row gap={L.size(28)}>
          {items.map((it, i) => (
            <React.Fragment key={keyOf(it)}>{render(it, width, i)}</React.Fragment>
          ))}
        </Stack>
      </ScrollView>
    </Stack>
  );
}
