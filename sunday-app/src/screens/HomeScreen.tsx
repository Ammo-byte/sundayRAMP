import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BACKGROUND = "#141414";
const WAVE_BAR_COUNT = 21;
const WAVE_COLORS = ["#6ba8ff", "#87d4ff", "#8f9dff", "#d7b8ff"];

function SiriOrb({ size }: { size: number }) {
  const orbit = useRef(new Animated.Value(0)).current;
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

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2600,
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
    pulseLoop.start();
    shimmerLoop.start();

    return () => {
      orbitLoop.stop();
      pulseLoop.stop();
      shimmerLoop.stop();
    };
  }, [orbit, pulse, shimmer]);

  const shellScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1.04],
  });
  const shellOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });
  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1.08, 1.22],
  });
  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.32],
  });

  const blobOneTranslateX = orbit.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [-size * 0.08, size * 0.12, size * 0.06, -size * 0.13, -size * 0.08],
  });
  const blobOneTranslateY = orbit.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [size * 0.06, -size * 0.14, size * 0.04, size * 0.13, size * 0.06],
  });
  const blobTwoTranslateX = orbit.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [size * 0.12, -size * 0.08, size * 0.16, size * 0.12],
  });
  const blobTwoTranslateY = orbit.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: [-size * 0.12, size * 0.09, size * 0.02, -size * 0.12],
  });
  const blobThreeTranslateX = orbit.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-size * 0.14, size * 0.15, -size * 0.14],
  });
  const blobThreeTranslateY = orbit.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-size * 0.02, size * 0.16, -size * 0.02],
  });

  const shimmerRotate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const shimmerTranslateX = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [-size * 0.16, size * 0.18, -size * 0.16],
  });
  const shimmerTranslateY = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [size * 0.12, -size * 0.1, size * 0.12],
  });

  return (
    <View style={styles.orbWrap}>
      <Animated.View
        style={[
          styles.orbGlow,
          {
            width: size + 42,
            height: size + 42,
            borderRadius: (size + 42) / 2,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.orbShell,
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
            styles.orbBlob,
            styles.orbBlobOne,
            {
              width: size * 0.76,
              height: size * 0.76,
              borderRadius: size * 0.38,
              transform: [
                { translateX: blobOneTranslateX },
                { translateY: blobOneTranslateY },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.orbBlob,
            styles.orbBlobTwo,
            {
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: size * 0.35,
              transform: [
                { translateX: blobTwoTranslateX },
                { translateY: blobTwoTranslateY },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.orbBlob,
            styles.orbBlobThree,
            {
              width: size * 0.62,
              height: size * 0.62,
              borderRadius: size * 0.31,
              transform: [
                { translateX: blobThreeTranslateX },
                { translateY: blobThreeTranslateY },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.orbShimmer,
            {
              width: size * 0.9,
              height: size * 0.9,
              borderRadius: size * 0.45,
              transform: [
                { translateX: shimmerTranslateX },
                { translateY: shimmerTranslateY },
                { rotate: shimmerRotate },
              ],
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

function SiriWaveField({ width }: { width: number }) {
  const bars = useMemo(
    () =>
      Array.from({ length: WAVE_BAR_COUNT }, (_, index) => {
        const center = (WAVE_BAR_COUNT - 1) / 2;
        const distance = Math.abs(index - center) / center;
        const height = 50 + (1 - Math.pow(distance, 1.5)) * 132;
        return {
          color: WAVE_COLORS[index % WAVE_COLORS.length],
          delay: index * 85,
          duration: 1200 + (index % 5) * 140,
          height,
        };
      }),
    []
  );

  const levels = useRef(bars.map(() => new Animated.Value(0.28))).current;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const animations = levels.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: bars[index].duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(value, {
            toValue: 0.22,
            duration: Math.round(bars[index].duration * 0.9),
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      )
    );

    animations.forEach((animation, index) => {
      const timer = setTimeout(() => animation.start(), bars[index].delay);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
      animations.forEach((animation) => animation.stop());
    };
  }, [bars, levels]);

  return (
    <View style={[styles.waveField, { width }]}>
      {bars.map((bar, index) => {
        const animatedHeight = levels[index].interpolate({
          inputRange: [0, 1],
          outputRange: [bar.height * 0.12, bar.height],
        });
        const animatedOpacity = levels[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0.18, 0.95],
        });

        return (
          <View key={index} style={[styles.waveSlot, { height: bar.height }]}>
            <Animated.View
              style={[
                styles.waveBar,
                {
                  backgroundColor: bar.color,
                  height: animatedHeight,
                  opacity: animatedOpacity,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

export function HomeScreen() {
  const { height, width } = useWindowDimensions();
  const orbSize = Math.min(124, Math.max(88, width * 0.24));
  const waveWidth = Math.min(width - 24, 720);
  const topSpacing = Math.max(72, height * 0.15);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={[styles.titleWrap, { marginTop: topSpacing }]}>
          <Text style={styles.title}>What can I help you with?</Text>
        </View>

        <View style={styles.visualWrap}>
          <SiriOrb size={orbSize} />
          <SiriWaveField width={waveWidth} />
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
    backgroundColor: BACKGROUND,
  },
  titleWrap: {
    alignItems: "center",
    paddingHorizontal: 28,
  },
  title: {
    color: "#f4f7fb",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "300",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  visualWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 64,
  },
  orbWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 52,
    zIndex: 2,
  },
  orbGlow: {
    position: "absolute",
    backgroundColor: "#5a7eff",
    shadowColor: "#86cfff",
    shadowOpacity: 0.28,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
  },
  orbShell: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#111f38",
    borderWidth: 1,
    borderColor: "rgba(180, 221, 255, 0.18)",
    shadowColor: "#73c8ff",
    shadowOpacity: 0.3,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
  },
  orbBlob: {
    position: "absolute",
  },
  orbBlobOne: {
    backgroundColor: "rgba(80, 159, 255, 0.92)",
  },
  orbBlobTwo: {
    backgroundColor: "rgba(150, 231, 255, 0.82)",
  },
  orbBlobThree: {
    backgroundColor: "rgba(246, 252, 255, 0.72)",
  },
  orbShimmer: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  waveField: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    columnGap: 6,
    paddingHorizontal: 6,
  },
  waveSlot: {
    width: 10,
    justifyContent: "flex-end",
  },
  waveBar: {
    width: "100%",
    borderRadius: 999,
  },
});
