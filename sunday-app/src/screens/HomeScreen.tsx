import Constants from "expo-constants";
import React from "react";
import { StatusBar, Platform, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKGROUND = "#000000";

function NativeSettingsButton() {
  if (Platform.OS !== "ios" || Constants.appOwnership === "expo") {
    return null;
  }

  const { Host, Button } = require("@expo/ui/swift-ui") as typeof import("@expo/ui/swift-ui");
  const {
    buttonStyle,
    controlSize,
    labelStyle,
  } = require("@expo/ui/swift-ui/modifiers") as typeof import("@expo/ui/swift-ui/modifiers");

  return (
    <View style={styles.topRightButton}>
      <Host matchContents colorScheme="dark">
        <Button
          label="Settings"
          systemImage="gear"
          onPress={() => {}}
          modifiers={[labelStyle("iconOnly"), controlSize("large"), buttonStyle("glass")]}
        />
      </Host>
    </View>
  );
}

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <NativeSettingsButton />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    position: "relative",
  },
  topRightButton: {
    position: "absolute",
    top: 8,
    right: 16,
    zIndex: 2,
  },
});
