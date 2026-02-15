const { withNxMetro } = require('@nx/expo');
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Standard synchronous configuration
const config = getDefaultConfig(__dirname);

// Nx Metro configuration
const nxConfig = withNxMetro(config, {
  debug: false,
  extensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  watchFolders: [],
});

// Helper to add SQLite assets
// const addAssets = (c) => {
//   ['wasm', 'sql'].forEach((ext) => {
//     if (!c.resolver.assetExts.includes(ext)) {
//       c.resolver.assetExts.push(ext);
//     }
//   });
//   c.resolver.sourceExts = c.resolver.sourceExts.filter(
//     (ext) => ext !== 'wasm' && ext !== 'sql'
//   );
//   return c;
// };

// Apply asset config
// const assetConfig = addAssets(nxConfig);

// NativeWind configuration - MUST be the outermost wrapper
module.exports = withNativeWind(nxConfig, { input: './global.css' });