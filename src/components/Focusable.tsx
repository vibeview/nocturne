import React, { useCallback, useEffect, useRef, useState } from 'react';
import { focusElement } from '../tv/focus';
import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type Children = React.ReactNode | ((state: { focused: boolean }) => React.ReactNode);

export interface FocusableProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  /** Layout for the outer pressable, e.g. `{ flex: 1 }` inside a row. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Applied while focused (remote) or hovered (LG pointer). */
  focusStyle?: StyleProp<ViewStyle>;
  /** Grow while focused, e.g. 1.06 for cards. */
  focusScale?: number;
  /** Takes focus when it appears: the element a screen starts on. */
  hasTVPreferredFocus?: boolean;
  children?: Children;
  onFocusChange?: (focused: boolean) => void;
}

// The grow on focus is a CSS transition, which the browser runs off the main
// thread (a JavaScript spring cost every focused and blurred card ~30 frames
// of script on a TV CPU). translateZ(0) keeps each growing element on its own
// GPU layer, so TV browsers scale it there instead of repainting it.
const grow = { transitionProperty: 'transform', transitionDuration: '160ms', transitionTimingFunction: 'ease-out' } as unknown as ViewStyle;

/**
 * Pressable that takes remote focus. It is a real DOM focus stop
 * (tabindex 0), so the arrow keys reach it (tv/focus.ts), OK presses it, and
 * VibeView sees it as the focused element.
 */
export function Focusable({
  style,
  containerStyle,
  focusStyle,
  focusScale = 1,
  hasTVPreferredFocus = false,
  children,
  onFocusChange,
  onFocus,
  onBlur,
  onHoverIn,
  onHoverOut,
  ...rest
}: FocusableProps): React.JSX.Element {
  const host = useRef<HTMLElement | null>(null);
  const ref = useCallback((node: unknown) => {
    host.current = node as HTMLElement | null;
  }, []);
  // The preferred element takes focus on mount, and is what tv/focus.ts falls
  // back to when focus is lost.
  useEffect(() => {
    if (hasTVPreferredFocus && host.current) focusElement(host.current);
  }, [hasTVPreferredFocus]);

  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const active = focused || hovered;

  const change = useCallback(
    (next: boolean) => {
      setFocused(next);
      onFocusChange?.(next);
    },
    [onFocusChange],
  );

  return (
    <Pressable
      {...rest}
      {...(hasTVPreferredFocus ? { dataSet: { tvPreferred: 'true' } } : null)}
      ref={ref}
      onFocus={(e) => {
        change(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        change(false);
        onBlur?.(e);
      }}
      onHoverIn={(e) => {
        setHovered(true);
        onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        setHovered(false);
        onHoverOut?.(e);
      }}
      style={containerStyle}
    >
      {({ pressed }) => (
        <View
          style={[
            style,
            focusScale !== 1 && grow,
            active && focusStyle,
            pressed && { opacity: 0.86 },
            focusScale !== 1 && { transform: `translateZ(0) scale(${active ? focusScale : 1})` },
          ]}
        >
          {typeof children === 'function' ? children({ focused: active }) : children}
        </View>
      )}
    </Pressable>
  );
}
