import React from "react";
import {
  Animated,
  Text,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  GestureResponderEvent,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecorder } from "../lib/recorder";
import { ActionItem } from "../lib/alertEntries";
import { persistRecordingFile } from "../lib/entryStore";
import { uploadRecordingForTranscription, uploadBlobForTranscription } from "../lib/transcription";

const BACKGROUND = "#121212";
const DOT_SIZE = Platform.OS === "web" ? 200 : 180;
const RECORDING = "#eb4034";
const MIN_RECORDING_DURATION_MILLIS = 150;
const TOO_SHORT_RECORDING_MESSAGE = "Recording was too short. Hold the button a little longer and try again.";

type HomeScreenProps = {
  isDemo?: boolean;
  hasEntries?: boolean;
  onBackgroundPress?: () => void;
  onNavigateToEntries?: () => void;
  onTranscriptPending?: (audioUri: string) => string;
  onTranscript?: (entryId: string, transcript: string, summary?: string, actions?: ActionItem[]) => void;
  onTranscriptError?: (entryId: string, message: string) => void;
  onRecordingChange?: (isRecording: boolean) => void;
};

export function HomeScreen({
  isDemo = false,
  hasEntries = false,
  onBackgroundPress,
  onNavigateToEntries,
  onTranscriptPending,
  onTranscript,
  onTranscriptError,
  onRecordingChange,
}: HomeScreenProps) {
  const recorder = useRecorder();
  const [isTogglingRecording, setIsTogglingRecording] = React.useState(false);
  const scale = React.useRef(new Animated.Value(1)).current;
  const isRecording = recorder.state.isRecording;

  React.useEffect(() => {
    onRecordingChange?.(isRecording);
  }, [isRecording, onRecordingChange]);

  const pulseDot = React.useCallback(() => {
    scale.stopAnimation(() => {
      scale.setValue(1);
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: 80, useNativeDriver: false }),
        Animated.spring(scale, { toValue: 1, speed: 50, bounciness: 10, useNativeDriver: false }),
      ]).start();
    });
  }, [scale]);

  const transcribeRecording = React.useCallback(
    async (entryId: string, source: string | Blob) => {
      try {
        console.log("[sunday] uploading recording for transcription");
        const result =
          typeof source === "string"
            ? await uploadRecordingForTranscription(source)
            : await uploadBlobForTranscription(source);
        console.log("[sunday] transcript:", result.text);
        console.log("[sunday] transcript title:", result.summary);
        onTranscript?.(entryId, result.text, result.summary, result.actions);
      } catch (error) {
        console.error("[sunday] transcription failed", error);
        const message = error instanceof Error ? error.message : "Transcription failed.";
        onTranscriptError?.(entryId, message);
      }
    },
    [onTranscript, onTranscriptError],
  );

  const startRecording = React.useCallback(async () => {
    setIsTogglingRecording(true);
    try {
      await recorder.start();
      console.log("[sunday] recording started");
    } catch (error) {
      console.warn("[sunday] could not start recording", error);
    } finally {
      setIsTogglingRecording(false);
    }
  }, [recorder]);

  const stopRecording = React.useCallback(async () => {
    setIsTogglingRecording(true);
    try {
      const result = await recorder.stop();

      if (result.durationMillis < MIN_RECORDING_DURATION_MILLIS) {
        console.log(`[sunday] recording ignored (${result.durationMillis}ms too short)`);
        const entryId = onTranscriptPending?.("") ?? `${Date.now()}`;
        onTranscriptError?.(entryId, TOO_SHORT_RECORDING_MESSAGE);
        return;
      }

      let source: string | Blob;
      let labelUri: string;

      if (result.blob) {
        // Web: upload blob directly, skip file system
        source = result.blob;
        labelUri =
          typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
            ? URL.createObjectURL(result.blob)
            : `web-${Date.now()}`;
      } else {
        // Native: persist to file system first
        const persisted = await persistRecordingFile(result.uri);
        source = persisted;
        labelUri = persisted;
      }

      console.log("[sunday] recording stopped");
      const entryId = onTranscriptPending?.(labelUri) ?? `${Date.now()}`;
      void transcribeRecording(entryId, source);
    } catch (error) {
      console.error("[sunday] failed to stop recording", error);
      const message = error instanceof Error ? error.message : "Failed to stop recording.";
      const entryId = onTranscriptPending?.("") ?? `${Date.now()}`;
      onTranscriptError?.(entryId, message);
    } finally {
      setIsTogglingRecording(false);
    }
  }, [onTranscriptError, onTranscriptPending, recorder, transcribeRecording]);

  const handleDotPress = React.useCallback(
    async (event?: GestureResponderEvent) => {
      event?.stopPropagation?.();
      if (isTogglingRecording) return;
      pulseDot();
      if (isRecording) {
        await stopRecording();
      } else {
        await startRecording();
      }
    },
    [isRecording, isTogglingRecording, pulseDot, startRecording, stopRecording],
  );

  return (
    <SafeAreaView style={styles.safe}>
      {Platform.OS !== "web" && <StatusBar barStyle="light-content" />}
      <View style={styles.container}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onBackgroundPress} />
        <View pointerEvents="box-none" style={styles.overlay}>
          <View style={styles.guideCard}>
            <Text style={styles.guideEyebrow}>{isDemo ? "DEMO START HERE" : "START HERE"}</Text>
            <Text style={styles.guideTitle}>
              {isDemo ? "See Sunday work in under a minute" : "Tap the dot to record a note"}
            </Text>
            <Text style={styles.guideBody}>
              {isDemo
                ? "If you want the walkthrough first, jump into Entries and open the card marked Start Here."
                : "Say the task naturally. Sunday will transcribe it, pull out actions, and save the result in Entries."}
            </Text>
            <View style={styles.guideSteps}>
              <Text style={styles.guideStep}>
                1. {isDemo ? "Open Entries from the bottom nav." : "Tap once to start recording."}
              </Text>
              <Text style={styles.guideStep}>
                2. {isDemo ? "Open “Voice note: booked product review for 2 PM.”" : "Tap again when you are done speaking."}
              </Text>
              <Text style={styles.guideStep}>
                3. {isDemo ? "Follow the in-app steps into Today to see the created event." : "Open Entries to review the transcript and actions."}
              </Text>
            </View>
            {onNavigateToEntries ? (
              <Pressable style={styles.guideButton} onPress={onNavigateToEntries}>
                <Text style={styles.guideButtonText}>
                  {isDemo ? "Open demo walkthrough" : hasEntries ? "Open Entries" : "See where notes go"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        <Pressable onPress={handleDotPress} style={styles.centerDotTapTarget}>
          <Animated.View
            style={[
              styles.centerDot,
              {
                backgroundColor: isRecording ? RECORDING : "#ffffff",
                transform: [{ scale }],
                opacity: isTogglingRecording ? 0.9 : 1,
              },
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 140,
  },
  guideCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 760,
    backgroundColor: "rgba(36, 36, 36, 0.92)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 20,
    gap: 10,
  },
  guideEyebrow: {
    color: "#8fb4ff",
    fontFamily: "GoogleSans-Bold",
    fontSize: 13,
    letterSpacing: 0.8,
  },
  guideTitle: {
    color: "#ffffff",
    fontFamily: "GoogleSans-Bold",
    fontSize: Platform.OS === "web" ? 34 : 30,
    lineHeight: Platform.OS === "web" ? 40 : 36,
  },
  guideBody: {
    color: "#d1d1d1",
    fontFamily: "GoogleSans-Regular",
    fontSize: 18,
    lineHeight: 28,
  },
  guideSteps: {
    gap: 8,
  },
  guideStep: {
    color: "#f5f5f5",
    fontFamily: "GoogleSans-Medium",
    fontSize: 18,
    lineHeight: 28,
  },
  guideButton: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  guideButtonText: {
    color: BACKGROUND,
    fontFamily: "GoogleSans-Bold",
    fontSize: 16,
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
