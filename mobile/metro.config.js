const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');

/**
 * Metro configuration for Expo
 * - Adds resolver.alias to map '@' to the local 'src' directory so that
 *   imports like `@/components/...` resolve to `./src/components/...`.
 */
const config = getDefaultConfig(__dirname);

config.resolver.alias = {
    ...(config.resolver.alias || {}),
    '@': path.resolve(__dirname, 'src'),
};

module.exports = config;
