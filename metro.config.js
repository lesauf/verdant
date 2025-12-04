const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NativeWind configuration
const nativeWindConfig = withNativeWind(config, { input: "./global.css" });

// SQLite Wasm configuration for Web
// Ensure wasm and sql are treated as assets, NOT as source
["wasm", "sql"].forEach(ext => {
  if (!nativeWindConfig.resolver.assetExts.includes(ext)) {
    nativeWindConfig.resolver.assetExts.push(ext);
  }
});

nativeWindConfig.resolver.sourceExts = nativeWindConfig.resolver.sourceExts.filter(
  (ext) => ext !== "wasm" && ext !== "sql"
);

module.exports = nativeWindConfig;
