import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import { color, fontFiles } from './theme';
import { onRemoteBack } from './tv/remote';
import { refocusIfLost, setupRemote } from './tv/focus';
import { nav, sectionKind, useStack, type Route } from './nav';
import { Home } from './screens/Home';
import { Browse } from './screens/Browse';
import { Detail } from './screens/Detail';
import { Player } from './screens/Player';
import { Profile } from './screens/Profile';
import { Search } from './screens/Search';

setupRemote();

function Screen({ route }: { route: Route }): React.JSX.Element {
  switch (route.name) {
    case 'detail':
      return <Detail key={route.id} id={route.id} />;
    case 'player':
      return <Player key={`${route.id}/${route.episode}`} id={route.id} episode={route.episode} />;
    case 'section':
      switch (route.section) {
        case 'home':
          return <Home />;
        case 'search':
          return <Search />;
        case 'profile':
          return <Profile />;
        default:
          return <Browse key={route.section} section={route.section} kind={sectionKind[route.section]} />;
      }
  }
}

function Shell(): React.JSX.Element {
  const stack = useStack();
  const top = stack[stack.length - 1]!;

  // Back on the remote goes back a screen.
  useEffect(() => onRemoteBack(() => nav.back()), []);

  // A new screen takes focus: its preferred element, else the section's own tab.
  useEffect(() => {
    const t = setTimeout(() => refocusIfLost(top.name === 'section' ? `nav-${top.section}` : undefined), 0);
    return () => clearTimeout(t);
  }, [top]);

  return (
    <View style={{ flex: 1, backgroundColor: color.ground }}>
      <Screen route={top} />
    </View>
  );
}

export function App(): React.JSX.Element | null {
  const [fontsLoaded] = useFonts(fontFiles);
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: color.ground }} />;
  return <Shell />;
}
