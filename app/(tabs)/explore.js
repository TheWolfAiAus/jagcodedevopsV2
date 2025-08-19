"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expo_image_1 = require("expo-image");
var react_native_1 = require("react-native");
var Collapsible_1 = require("@/components/Collapsible");
var ExternalLink_1 = require("@/components/ExternalLink");
var ParallaxScrollView_1 = require("@/components/ParallaxScrollView");
var ThemedText_1 = require("@/components/ThemedText");
var ThemedView_1 = require("@/components/ThemedView");
var IconSymbol_1 = require("@/components/ui/IconSymbol");
function TabTwoScreen() {
    return (<ParallaxScrollView_1.default headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }} headerImage={<IconSymbol_1.IconSymbol size={310} color="#808080" name="chevron.left.forwardslash.chevron.right" style={styles.headerImage}/>}>
      <ThemedView_1.ThemedView style={styles.titleContainer}>
        <ThemedText_1.ThemedText type="title">Explore</ThemedText_1.ThemedText>
      </ThemedView_1.ThemedView>
      <ThemedText_1.ThemedText>This app includes example code to help you get started.</ThemedText_1.ThemedText>
      <Collapsible_1.Collapsible title="File-based routing">
        <ThemedText_1.ThemedText>
          This app has two screens:{' '}
          <ThemedText_1.ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText_1.ThemedText> and{' '}
          <ThemedText_1.ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText_1.ThemedText>
        </ThemedText_1.ThemedText>
        <ThemedText_1.ThemedText>
          The layout file in <ThemedText_1.ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText_1.ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText_1.ThemedText>
        <ExternalLink_1.ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText_1.ThemedText type="link">Learn more</ThemedText_1.ThemedText>
        </ExternalLink_1.ExternalLink>
      </Collapsible_1.Collapsible>
      <Collapsible_1.Collapsible title="Android, iOS, and web support">
        <ThemedText_1.ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText_1.ThemedText type="defaultSemiBold">w</ThemedText_1.ThemedText> in the terminal running this project.
        </ThemedText_1.ThemedText>
      </Collapsible_1.Collapsible>
      <Collapsible_1.Collapsible title="Images">
        <ThemedText_1.ThemedText>
          For static images, you can use the <ThemedText_1.ThemedText type="defaultSemiBold">@2x</ThemedText_1.ThemedText> and{' '}
          <ThemedText_1.ThemedText type="defaultSemiBold">@3x</ThemedText_1.ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText_1.ThemedText>
        <expo_image_1.Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }}/>
        <ExternalLink_1.ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText_1.ThemedText type="link">Learn more</ThemedText_1.ThemedText>
        </ExternalLink_1.ExternalLink>
      </Collapsible_1.Collapsible>
      <Collapsible_1.Collapsible title="Custom fonts">
        <ThemedText_1.ThemedText>
          Open <ThemedText_1.ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText_1.ThemedText> to see how to load{' '}
          <ThemedText_1.ThemedText style={{ fontFamily: 'SpaceMono' }}>
            custom fonts such as this one.
          </ThemedText_1.ThemedText>
        </ThemedText_1.ThemedText>
        <ExternalLink_1.ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
          <ThemedText_1.ThemedText type="link">Learn more</ThemedText_1.ThemedText>
        </ExternalLink_1.ExternalLink>
      </Collapsible_1.Collapsible>
      <Collapsible_1.Collapsible title="Light and dark mode components">
        <ThemedText_1.ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText_1.ThemedText type="defaultSemiBold">useColorScheme()</ThemedText_1.ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText_1.ThemedText>
        <ExternalLink_1.ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText_1.ThemedText type="link">Learn more</ThemedText_1.ThemedText>
        </ExternalLink_1.ExternalLink>
      </Collapsible_1.Collapsible>
      <Collapsible_1.Collapsible title="Animations">
        <ThemedText_1.ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText_1.ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText_1.ThemedText> component uses
          the powerful <ThemedText_1.ThemedText type="defaultSemiBold">react-native-reanimated</ThemedText_1.ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText_1.ThemedText>
        {react_native_1.Platform.select({
            ios: (<ThemedText_1.ThemedText>
              The <ThemedText_1.ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText_1.ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText_1.ThemedText>),
        })}
      </Collapsible_1.Collapsible>
    </ParallaxScrollView_1.default>);
}
exports.default = TabTwoScreen;
var styles = react_native_1.StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
});
