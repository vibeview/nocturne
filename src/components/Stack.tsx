import React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

// Spacing without CSS `gap`: flexbox gap needs Chrome 84, and LG webOS 6 runs
// Chrome 79, where every `gap` is silently dropped.

/** A row or column with `gap` between its children, as spacer views. */
export function Stack({ gap, row = false, style, children, ...rest }: ViewProps & { gap: number; row?: boolean; style?: StyleProp<ViewStyle> }): React.JSX.Element {
  const items = React.Children.toArray(children);
  const spacer = row ? { width: gap } : { height: gap };
  return (
    <View {...rest} style={[row && { flexDirection: 'row' }, style]}>
      {items.map((child, i) => (i === 0 ? child : [<View key={`gap-${i}`} style={spacer} />, child]))}
    </View>
  );
}

/** Items that wrap onto new lines, `gap` apart both ways. */
export function Grid({ gap, style, children }: { gap: number; style?: StyleProp<ViewStyle>; children: React.ReactNode }): React.JSX.Element {
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', marginRight: -gap, marginBottom: -gap }, style]}>
      {React.Children.toArray(children).map((child, i) => (
        <View key={React.isValidElement(child) && child.key != null ? child.key : i} style={{ marginRight: gap, marginBottom: gap }}>
          {child}
        </View>
      ))}
    </View>
  );
}
