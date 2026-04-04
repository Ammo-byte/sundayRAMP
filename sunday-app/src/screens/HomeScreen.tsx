import React from "react";
import { Pressable, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SettingsIcon from "../../assets/settings.svg";

const BACKGROUND = "#121212";
const DOT_SIZE = "50%";
const RECORDING = "#eb4034";

export function HomeScreen() {
  const [isRecording, setIsRecording] = React.useState(false);

  const handleDotPress = React.useCallback(() => {
    setIsRecording((current) => !current);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Pressable onPress={() => {}} style={styles.topRightButton}>
          <SettingsIcon width={34} height={34} />
        </Pressable>
        <Pressable onPress={handleDotPress} style={styles.centerDotTapTarget}>
          <View
            style={[
              styles.centerDot,
              { backgroundColor: isRecording ? RECORDING : "#ffffff" },
            ]}
          />
        </Pressable>
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
    alignItems: "center",
    justifyContent: "center",
  },
  topRightButton: {
    position: "absolute",
    top: 12,
    right: 18,
    zIndex: 2,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  centerDotTapTarget: {
    width: DOT_SIZE,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerDot: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
});
