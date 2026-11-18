// The packaged TV app (scripts/build-tv.mjs) loads from the TV's file system,
// not a web server, so its script and asset paths must be relative. The dev
// server (`pnpm start`) keeps Expo's defaults.
module.exports = ({ config }) =>
  process.env.NOCTURNE_TV_PACKAGE === '1' ? { ...config, experiments: { ...config.experiments, baseUrl: '.' } } : config;
