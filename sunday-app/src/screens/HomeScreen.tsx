import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";

const BACKGROUND = "#000000";
const ORB_VIDEO_URL =
  "https://www.apple.com/105/media/us/siri/2018/ee7c4c16_aae5_4678_9cdd_7ca813baf929/films/siri_orb_large.mp4";

export function HomeScreen() {
  const player = useVideoPlayer(ORB_VIDEO_URL, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.play();
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.orbFrame}>
          <VideoView
            player={player}
            nativeControls={false}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            contentFit="cover"
            style={styles.orbVideo}
          />
        </View>
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BACKGROUND,
  },
  orbFrame: {
    width: 170,
    height: 170,
    borderRadius: 85,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  orbVideo: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "transparent",
  },
});
