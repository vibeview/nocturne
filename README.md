# Nocturne TV

A streaming app for Samsung (Tizen) and LG (webOS) TVs: a home screen with a
hero and rails of titles, Series, Films, Documentaries and My list grids, a
detail page per title, a video player with subtitles, search and a profile
with playback settings. Everything is bundled: no account, no server, no
network.

**This is a sample app.** It shows a TV web app set up for testing on
VibeView's Samsung and LG TVs: remote focus the TV's automation layer can
read, stable test ids, and one build script that produces both TV packages.
The titles, artwork and episode clips are invented (see [NOTICE.md](NOTICE.md)).

## The app

- **Home**: the featured title with Play, My list and Details; below it
  Continue watching, Top 10 and genre rails. The backdrop follows the
  focused title.
- **Series, Films, Documentaries, My list**: poster grids.
- **Detail**: Play (or Resume), My list, the episodes and More like this.
- **Player**: the title's clip, looped inside the episode's real running
  time, with Back, rewind and forward 10 seconds, play/pause and subtitles.
  The controls hide after five seconds; any key brings them back.
- **Search**: a field, mood suggestions and a results grid.
- **Profile**: the account and three playback switches.

Stack: Expo SDK 56 for the web, React Native through react-native-web,
expo-video, TypeScript. The repo has no native iOS or Android project.

## Remote and focus

The remote moves the browser's own focus, so the focused element is
`document.activeElement` and OK presses it:

- The arrow keys pick the next element in their direction with
  [`@bbc/tv-lrud-spatial`](https://github.com/bbc/lrud-spatial). Left and
  Right stay in their row; at the end of a row they do nothing.
- Each screen opens on one element (`hasTVPreferredFocus`): Play on Home and
  Detail, the first poster in a grid, the first suggestion on Search.
- [`@vibeview/tv-focus`](https://github.com/vibeview/tv-focus) marks every
  focused element (`src/tv/focus.ts`), so VibeView reads focus the same way
  in every app that uses it. Recorded tests replay by element ("select
  Films") instead of by key presses.
- Back (Samsung 10009, LG 461; Escape in a desktop browser) goes back a
  screen. On Home it does nothing.
- In the player, Play and Pause toggle playback and Rewind and Fast forward
  skip 10 seconds.

Every control has a `data-testid` (React Native's `testID`):
`nav-home`, `nav-series`, `nav-films`, `nav-documentaries`, `nav-list`,
`nav-search`, `nav-profile`, `hero-play`, `hero-my-list`, `hero-details`,
`poster-<id>`, `card-<id>`, `detail-play`, `detail-my-list`, `detail-back`,
`episode-<n>`, `player-back`, `player-rewind`, `player-play-pause`,
`player-forward`, `player-subtitles`, `player-title`, `player-time`,
`search-input`, `suggestion-<mood>`, `search-summary`, `setting-<id>`.

The app logs what it does to the console (`[nav] detail/low-orbit`,
`[player] pause at 4:12`, `[search] "jazz": 2 results`), which shows up in
VibeView's app log for each session and run.

## Building

You need Node 20+ and pnpm. For the LG package, also `ares-package` from the
[webOS CLI](https://www.npmjs.com/package/@webos-tools/cli).

```sh
pnpm install
pnpm start        # the app in a desktop browser; arrows, Enter and Escape act as the remote
pnpm build        # dist/Nocturne.wgt and dist/io.vibeview.nocturne_1.0.0_all.ipk
pnpm typecheck
pnpm test
```

`pnpm build` (`scripts/build-tv.mjs`) exports the web build with relative
paths, since a packaged TV app loads from the TV's file system, lowers the
JavaScript to Chrome 79 (LG webOS 6, the oldest browser among VibeView's TVs;
`src/polyfills.ts` fills the newer built-ins), then packages it:

| TV | Package | App id | Manifest |
|---|---|---|---|
| Samsung (Tizen) | `dist/Nocturne.wgt`, unsigned | `VvNocturne.Nocturne` | `packaging/tizen/config.xml` |
| LG (webOS) | `dist/io.vibeview.nocturne_1.0.0_all.ipk` | `io.vibeview.nocturne` | `packaging/webos/appinfo.json` |

VibeView re-signs Samsung apps when it installs them, so the `.wgt` is
unsigned. To install it on your own Samsung TV, sign it with your Tizen
certificate profile first.

Artwork: the full-size posters are in `art/`. `bash scripts/make-images.sh`
makes the 520x780 copies the app ships, and `bash scripts/make-clips.sh` films
the episode clips from the artwork (both need ffmpeg).

## Testing on VibeView

Upload `Nocturne.wgt` as a Samsung app and the `.ipk` as an LG app, then
start a session on that TV. The remote in the session sends the TV's own
keys; the UI tree shows the page's elements with their test ids and marks
the focused one.

## License

MIT. Artwork, video and fonts: see [NOTICE.md](NOTICE.md).
