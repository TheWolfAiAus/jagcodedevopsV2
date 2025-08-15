"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expo_image_1 = require("expo-image");
var react_native_1 = require("react-native");
var HelloWave_1 = require("@/components/HelloWave");
var ParallaxScrollView_1 = require("@/components/ParallaxScrollView");
var ThemedText_1 = require("@/components/ThemedText");
var ThemedView_1 = require("@/components/ThemedView");
function HomeScreen() {
    return (<ParallaxScrollView_1.default headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }} headerImage={<expo_image_1.Image source={require('@/assets/images/partial-react-logo.png')} style={styles.reactLogo}/>}>
      <ThemedView_1.ThemedView style={styles.titleContainer}>
        <ThemedText_1.ThemedText type="title">Welcome!</ThemedText_1.ThemedText>
        <HelloWave_1.HelloWave />
      </ThemedView_1.ThemedView>
      <ThemedView_1.ThemedView style={styles.stepContainer}>
        <ThemedText_1.ThemedText type="subtitle">Step 1: Try it</ThemedText_1.ThemedText>
        <ThemedText_1.ThemedText>
          Edit <ThemedText_1.ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText_1.ThemedText> to see changes.
          Press{' '}
          <ThemedText_1.ThemedText type="defaultSemiBold">
            {react_native_1.Platform.select({
            ios: 'cmd + d',
            android: 'cmd + m',
            web: 'F12',
        })}
          </ThemedText_1.ThemedText>{' '}
          to open developer tools.
        </ThemedText_1.ThemedText>
      </ThemedView_1.ThemedView>
      <ThemedView_1.ThemedView style={styles.stepContainer}>
        <ThemedText_1.ThemedText type="subtitle">Step 2: Explore</ThemedText_1.ThemedText>
        <ThemedText_1.ThemedText>
          {"Tap the Explore tab to learn more about what's included in this starter app."}
        </ThemedText_1.ThemedText>
      </ThemedView_1.ThemedView>
      <ThemedView_1.ThemedView style={styles.stepContainer}>
        <ThemedText_1.ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText_1.ThemedText>
        <ThemedText_1.ThemedText>
          {"When you're ready, run "}
          <ThemedText_1.ThemedText type="defaultSemiBold">npm run reset-project</ThemedText_1.ThemedText> to get a fresh{' '}
          <ThemedText_1.ThemedText type="defaultSemiBold">app</ThemedText_1.ThemedText> directory. This will move the current{' '}
          <ThemedText_1.ThemedText type="defaultSemiBold">app</ThemedText_1.ThemedText> to{' '}
          <ThemedText_1.ThemedText type="defaultSemiBold">app-example</ThemedText_1.ThemedText>.
        </ThemedText_1.ThemedText>
      </ThemedView_1.ThemedView>
    </ParallaxScrollView_1.default>);
}
exports.default = HomeScreen;
var styles = react_native_1.StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
});
