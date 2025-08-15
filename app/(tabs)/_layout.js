"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expo_router_1 = require("expo-router");
var react_1 = require("react");
var react_native_1 = require("react-native");
var HapticTab_1 = require("@/components/HapticTab");
var IconSymbol_1 = require("@/components/ui/IconSymbol");
var TabBarBackground_1 = require("@/components/ui/TabBarBackground");
var Colors_1 = require("@/constants/Colors");
var useColorScheme_1 = require("@/hooks/useColorScheme");
function TabLayout() {
    var colorScheme = (0, useColorScheme_1.useColorScheme)();
    return (<expo_router_1.Tabs screenOptions={{
            tabBarActiveTintColor: Colors_1.Colors[colorScheme !== null && colorScheme !== void 0 ? colorScheme : 'light'].tint,
            headerShown: false,
            tabBarButton: HapticTab_1.HapticTab,
            tabBarBackground: TabBarBackground_1.default,
            tabBarStyle: react_native_1.Platform.select({
                ios: {
                    // Use a transparent background on iOS to show the blur effect
                    position: 'absolute',
                },
                default: {},
            }),
        }}>
      <expo_router_1.Tabs.Screen name="index" options={{
            title: 'Home',
            tabBarIcon: function (_a) {
                var color = _a.color;
                return <IconSymbol_1.IconSymbol size={28} name="house.fill" color={color}/>;
            },
        }}/>
      <expo_router_1.Tabs.Screen name="explore" options={{
            title: 'Explore',
            tabBarIcon: function (_a) {
                var color = _a.color;
                return <IconSymbol_1.IconSymbol size={28} name="paperplane.fill" color={color}/>;
            },
        }}/>
    </expo_router_1.Tabs>);
}
exports.default = TabLayout;
