import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKGROUND = "#141414";
const ORB_MAX_SIZE = 228;
const ORB_MIN_SIZE = 150;

function AnimatedOrb({ size }: { size: number }) {
  const orbit = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const orbitLoop = Animated.loop(
      Animated.timing(orbit, {
        toValue: 1,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    const shimmerLoop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    orbitLoop.start();
    driftLoop.start();
    pulseLoop.start();
    shimmerLoop.start();

    return () => {
      orbitLoop.stop();
      driftLoop.stop();
      pulseLoop.stop();
      shimmerLoop.stop();
    };
  }, [drift, orbit, pulse, shimmer]);

  const shellScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1.03],
  });
  const shellOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const haloScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1.05, 1.18],
  });
  const haloOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.33],
  });

  const blobOneTranslateX = orbit.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [-size * 0.1, size * 0.12, size * 0.08, -size * 0.14, -size * 0.1],
  });
  const blobOneTranslateY = orbit.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [size * 0.08, -size * 0.12, size * 0.04, size * 0.12, size * 0.08],
  });
  const blobOneScale = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.12],
  });

  const blobTwoTranslateX = orbit.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [size * 0.12, -size * 0.08, size * 0.16, size * 0.12],
  });
  const blobTwoTranslateY = orbit.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [-size * 0.12, size * 0.1, size * 0.02, -size * 0.12],
  });
  const blobTwoScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1.08, 0.9],
  });

  const blobThreeTranslateX = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 0.14, size * 0.14],
  });
  const blobThreeTranslateY = orbit.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-size * 0.04, size * 0.15, -size * 0.04],
  });
  const blobThreeScale = orbit.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.03, 0.84, 1.03],
  });

  const shimmerRotate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const shimmerTranslateX = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-size * 0.18, size * 0.2, -size * 0.18],
  });
  const shimmerTranslateY = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [size * 0.18, -size * 0.12, size * 0.18],
  });

  return (
    <View style={styles.orbWrap}>
      <Animated.View
        style={[
          styles.halo,
          {
            width: size + 40,
            height: size + 40,
            borderRadius: (size + 40) / 2,
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.shell,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: shellOpacity,
            transform: [{ scale: shellScale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.blob,
            styles.blobOne,
            {
              width: size * 0.74,
              height: size * 0.74,
              borderRadius: size * 0.37,
              transform: [
                { translateX: blobOneTranslateX },
                { translateY: blobOneTranslateY },
                { scale: blobOneScale },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.blob,
            styles.blobTwo,
            {
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: size * 0.35,
              transform: [
                { translateX: blobTwoTranslateX },
                { translateY: blobTwoTranslateY },
                { scale: blobTwoScale },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.blob,
            styles.blobThree,
            {
              width: size * 0.62,
              height: size * 0.62,
              borderRadius: size * 0.31,
              transform: [
                { translateX: blobThreeTranslateX },
                { translateY: blobThreeTranslateY },
                { scale: blobThreeScale },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.shimmer,
            {
              width: size * 0.92,
              height: size * 0.92,
              borderRadius: size * 0.46,
              transform: [
                { translateX: shimmerTranslateX },
                { translateY: shimmerTranslateY },
                { rotate: shimmerRotate },
              ],
            },
          ]}
        />

        <View
          style={[
            styles.innerShade,
            {
              width: size * 0.96,
              height: size * 0.96,
              borderRadius: size * 0.48,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const orbSize = Math.min(ORB_MAX_SIZE, Math.max(ORB_MIN_SIZE, width * 0.47));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <AnimatedOrb size={orbSize} />
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
  orbWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    backgroundColor: "#2d93ff",
  },
  shell: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#102339",
    borderWidth: 1,
    borderColor: "rgba(182, 228, 255, 0.2)",
    shadowColor: "#6ec5ff",
    shadowOpacity: 0.35,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 0 },
  },
  blob: {
    position: "absolute",
  },
  blobOne: {
    backgroundColor: "rgba(62, 159, 255, 0.88)",
  },
  blobTwo: {
    backgroundColor: "rgba(130, 222, 255, 0.8)",
  },
  blobThree: {
    backgroundColor: "rgba(239, 255, 255, 0.72)",
  },
  shimmer: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.11)",
  },
  innerShade: {
    position: "absolute",
    backgroundColor: "rgba(9, 18, 33, 0.18)",
  },
});
