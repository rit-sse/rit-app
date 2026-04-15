const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)

if (!config.resolver.assetExts.includes("txt")) {
  config.resolver.assetExts.push("txt");
}
 
module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 })
