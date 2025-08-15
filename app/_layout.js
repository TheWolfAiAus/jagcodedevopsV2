"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var expo_font_1 = require("expo-font");
var expo_router_1 = require("expo-router");
var expo_status_bar_1 = require("expo-status-bar");
require("react-native-reanimated");
var useColorScheme_1 = require("@/hooks/useColorScheme");
function RootLayout() {
    var colorScheme = (0, useColorScheme_1.useColorScheme)();
    var loaded = (0, expo_font_1.useFonts)({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    })[0];
    if (!loaded) {
        // Async font loading only occurs in development.
        return null;
    }
    return (<native_1.ThemeProvider value={colorScheme === 'dark' ? native_1.DarkTheme : native_1.DefaultTheme}>
      <expo_router_1.Stack>
        <expo_router_1.Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
        <expo_router_1.Stack.Screen name="+not-found"/>
      </expo_router_1.Stack>
      <expo_status_bar_1.StatusBar style="auto"/>
    </native_1.ThemeProvider>);
}
exports.default = RootLayout;
