import React from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { File } from "expo-file-system";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { FONTS } from "../constants/fonts";
import { AlertEntry } from "../lib/alertEntries";

const BACKGROUND = "#121212";
const CARD = "#242424";
const EMPTY = "#8b8b8b";
const DELETE = "#eb4034";
const DETAIL_TRACK = "#2b2b2b";

type AlertsScreenProps = {
  entries: AlertEntry[];
  onDeleteEntry?: (entryId: string) => void;
};

type AlertRowProps = {
  item: AlertEntry;
  onOpenEntry?: (entryId: string) => void;
  onDeleteEntry?: (entryId: string) => void;
};

type EntryDetailModalProps = {
  entry: AlertEntry;
  onClose: () => void;
};

function TrashIcon({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960" fill="none">
      <Path
        d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
        fill={color}
      />
    </Svg>
  );
}

function PlayCircleIcon({ size = 28, color = "#e3e3e3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960" fill="none">
      <Path
        d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
        fill={color}
      />
    </Svg>
  );
}

function PauseCircleIcon({ size = 28, color = "#e3e3e3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960" fill="none">
      <Path
        d="M360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
        fill={color}
      />
    </Svg>
  );
}

function formatTimestamp(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderEmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No transcriptions yet</Text>
      <Text style={styles.emptyBody}>Recorded notes will show up here.</Text>
    </View>
  );
}

function EntryDetailModal({ entry, onClose }: EntryDetailModalProps) {
  const insets = useSafeAreaInsets();
  const progressAnimated = React.useRef(new Animated.Value(0)).current;
  const scrubProgressRef = React.useRef(0);
  const player = useAudioPlayer(entry.audioUri ? { uri: entry.audioUri } : null, {
    updateInterval: 50,
  });
  const playbackStatus = useAudioPlayerStatus(player);
  const progress =
    playbackStatus.duration > 0
      ? Math.min(1, Math.max(0, playbackStatus.currentTime / playbackStatus.duration))
      : 0;
  const [progressTrackWidth, setProgressTrackWidth] = React.useState(0);
  const [isScrubbing, setIsScrubbing] = React.useState(false);

  React.useEffect(() => {
    if (isScrubbing) {
      return;
    }

    Animated.timing(progressAnimated, {
      toValue: progress,
      duration: 90,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [isScrubbing, progress, progressAnimated]);

  React.useEffect(() => {
    if (!entry.audioUri || !playbackStatus.didJustFinish) {
      return;
    }

    setIsScrubbing(false);
    scrubProgressRef.current = 0;
    progressAnimated.setValue(0);
    void player.seekTo(0).catch(() => undefined);
  }, [entry.audioUri, playbackStatus.didJustFinish, player, progressAnimated]);

  const updateScrubProgress = React.useCallback((locationX: number) => {
    if (!progressTrackWidth) {
      return 0;
    }

    const nextProgress = Math.min(1, Math.max(0, locationX / progressTrackWidth));
    scrubProgressRef.current = nextProgress;
    progressAnimated.setValue(nextProgress);
    return nextProgress;
  }, [progressAnimated, progressTrackWidth]);

  const commitScrubProgress = React.useCallback(async (locationX: number) => {
    const nextProgress = updateScrubProgress(locationX);
    setIsScrubbing(false);

    if (playbackStatus.playing) {
      player.pause();
    }

    if (playbackStatus.duration > 0) {
      await player.seekTo(nextProgress * playbackStatus.duration).catch(() => undefined);
    }
  }, [playbackStatus.duration, playbackStatus.playing, player, updateScrubProgress]);

  const handleScrubGrant = React.useCallback((locationX: number) => {
    setIsScrubbing(true);
    if (playbackStatus.playing) {
      player.pause();
    }
    updateScrubProgress(locationX);
  }, [playbackStatus.playing, player, updateScrubProgress]);

  const handlePlayPausePress = React.useCallback(async () => {
    if (!entry.audioUri) {
      return;
    }

    const audioFile = new File(entry.audioUri);
    if (!audioFile.exists) {
      console.warn("[sunday] saved audio file is missing", entry.audioUri);
      return;
    }

    if (playbackStatus.playing) {
      player.pause();
      return;
    }

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    });

    if (
      playbackStatus.duration > 0 &&
      playbackStatus.currentTime >= Math.max(playbackStatus.duration - 0.05, 0)
    ) {
      await player.seekTo(0).catch(() => undefined);
    }

    console.log("[sunday] playing saved audio", entry.audioUri);
    player.play();
  }, [entry.audioUri, playbackStatus.currentTime, playbackStatus.duration, playbackStatus.playing, player]);

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={[]} style={styles.detailSafe}>
        <StatusBar barStyle="light-content" />
        <View
          style={[
            styles.detailContent,
            {
              paddingTop: insets.top + 10,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <View style={styles.detailTopBar}>
            <Pressable onPress={onClose} style={styles.detailCloseButton}>
              <Text style={styles.detailCloseText}>Close</Text>
            </Pressable>
          </View>

          <View style={styles.detailHeaderRow}>
            <Text numberOfLines={2} style={styles.detailTitle}>
              {entry.summary}
            </Text>
            <Text style={styles.detailTimestamp}>{formatTimestamp(entry.createdAt)}</Text>
          </View>

          {entry.audioUri ? (
            <View style={styles.detailControlsRow}>
              <Pressable onPress={handlePlayPausePress} style={styles.detailPlayButton}>
                {playbackStatus.playing ? <PauseCircleIcon size={34} /> : <PlayCircleIcon size={34} />}
              </Pressable>
              <View
                onLayout={(event) => setProgressTrackWidth(event.nativeEvent.layout.width)}
                onMoveShouldSetResponder={() => true}
                onStartShouldSetResponder={() => true}
                onResponderGrant={(event) => handleScrubGrant(event.nativeEvent.locationX)}
                onResponderMove={(event) => updateScrubProgress(event.nativeEvent.locationX)}
                onResponderRelease={(event) => {
                  void commitScrubProgress(event.nativeEvent.locationX);
                }}
                onResponderTerminate={(event) => {
                  void commitScrubProgress(event.nativeEvent.locationX);
                }}
                style={styles.detailProgressTrack}
              >
                <Animated.View
                  style={[
                    styles.detailProgressFill,
                    {
                      width: progressAnimated.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, progressTrackWidth],
                        extrapolate: "clamp",
                      }),
                    },
                  ]}
                />
              </View>
            </View>
          ) : null}

          <ScrollView
            style={styles.detailTranscriptWrap}
            contentContainerStyle={styles.detailTranscriptContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.detailTranscript}>
              {entry.transcript || "No transcript available yet."}
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function AlertRow({ item, onOpenEntry, onDeleteEntry }: AlertRowProps) {
  const closeBounceX = React.useRef(new Animated.Value(0)).current;

  const handleSwipeableWillClose = React.useCallback(() => {
    closeBounceX.stopAnimation();
    closeBounceX.setValue(0);
    Animated.sequence([
      Animated.timing(closeBounceX, {
        toValue: 10,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(closeBounceX, {
        toValue: 0,
        speed: 22,
        bounciness: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [closeBounceX]);

  const renderRightActions = React.useCallback(
    (
      progress: Animated.AnimatedInterpolation<number>,
      dragX: Animated.AnimatedInterpolation<number>,
    ) => {
      const opacity = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 1],
        extrapolate: "clamp",
      });
      const scale = progress.interpolate({
        inputRange: [0, 0.8, 1, 1.18],
        outputRange: [0.86, 0.95, 1.06, 1],
        extrapolate: "clamp",
      });
      const translateX = dragX.interpolate({
        inputRange: [-156, -96, 0],
        outputRange: [-8, 0, 0],
        extrapolate: "clamp",
      });

      return (
        <Animated.View
          style={[
            styles.deleteActionWrap,
            { opacity, transform: [{ translateX }, { scale }] },
          ]}
        >
          <Pressable onPress={() => onDeleteEntry?.(item.id)} style={styles.deleteAction}>
            <TrashIcon />
          </Pressable>
        </Animated.View>
      );
    },
    [item.id, onDeleteEntry],
  );

  return (
    <View style={styles.rowWrap}>
      <Animated.View style={{ transform: [{ translateX: closeBounceX }] }}>
        <Swipeable
          friction={1.25}
          overshootRight
          overshootFriction={6}
          rightThreshold={30}
          containerStyle={styles.swipeableContainer}
          childrenContainerStyle={styles.swipeableChildren}
          onSwipeableWillClose={handleSwipeableWillClose}
          renderRightActions={renderRightActions}
        >
          <Pressable onPress={() => onOpenEntry?.(item.id)} style={styles.card}>
            <View style={styles.cardMain}>
              {item.status === "pending" ? (
                <View style={styles.loadingSpinnerWrap}>
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
              ) : null}
              <View style={styles.cardText}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.summary}>
                  {item.status === "pending" ? "Transcription loading..." : item.summary}
                </Text>
                {item.status === "failed" && item.transcript ? (
                  <Text style={styles.failureBody}>{item.transcript}</Text>
                ) : null}
              </View>
            </View>
            <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
          </Pressable>
        </Swipeable>
      </Animated.View>
    </View>
  );
}

export function AlertsScreen({ entries, onDeleteEntry }: AlertsScreenProps) {
  const insets = useSafeAreaInsets();
  const headerTopInset = insets.top + 8;
  const [selectedEntryId, setSelectedEntryId] = React.useState<string | null>(null);

  const selectedEntry = React.useMemo(
    () => entries.find((entry) => entry.id === selectedEntryId) ?? null,
    [entries, selectedEntryId],
  );

  React.useEffect(() => {
    if (selectedEntryId && !selectedEntry) {
      setSelectedEntryId(null);
    }
  }, [selectedEntry, selectedEntryId]);

  return (
    <SafeAreaView edges={[]} style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={entries.length ? styles.listContent : styles.emptyContent}
        removeClippedSubviews={false}
        scrollEnabled
        bounces
        alwaysBounceVertical
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
        ListHeaderComponent={(
          <View style={[styles.header, { paddingTop: headerTopInset }]}>
            <Text style={styles.headerTitle}>Entries</Text>
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => (
          <AlertRow
            item={item}
            onOpenEntry={setSelectedEntryId}
            onDeleteEntry={onDeleteEntry}
          />
        )}
      />

      {selectedEntry ? (
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntryId(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  emptyContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontFamily: FONTS.semibold,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontFamily: FONTS.semibold,
    marginBottom: 8,
  },
  emptyBody: {
    color: EMPTY,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: FONTS.regular,
    textAlign: "center",
    maxWidth: 260,
  },
  card: {
    minHeight: 72,
    borderRadius: 18,
    backgroundColor: CARD,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  cardMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
  },
  loadingSpinnerWrap: {
    width: 20,
    height: 20,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
  },
  summary: {
    color: "#ffffff",
    fontSize: 17,
    lineHeight: 24,
    fontFamily: FONTS.medium,
  },
  failureBody: {
    marginTop: 6,
    color: EMPTY,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONTS.regular,
  },
  timestamp: {
    color: EMPTY,
    fontSize: 13,
    fontFamily: FONTS.medium,
    textAlign: "right",
  },
  rowSeparator: {
    height: 12,
  },
  rowWrap: {
    paddingHorizontal: 18,
    overflow: "visible",
  },
  swipeableContainer: {
    overflow: "visible",
  },
  swipeableChildren: {
    overflow: "visible",
  },
  deleteActionWrap: {
    width: 88,
    paddingLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteAction: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: DELETE,
    alignItems: "center",
    justifyContent: "center",
  },
  detailSafe: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailTopBar: {
    alignItems: "flex-end",
    marginBottom: 18,
  },
  detailCloseButton: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#202020",
  },
  detailCloseText: {
    color: "#ffffff",
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  detailHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 18,
  },
  detailTitle: {
    flex: 1,
    color: "#ffffff",
    fontSize: 28,
    lineHeight: 34,
    fontFamily: FONTS.semibold,
  },
  detailTimestamp: {
    color: EMPTY,
    fontSize: 15,
    fontFamily: FONTS.medium,
    paddingTop: 6,
  },
  detailControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  detailPlayButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  detailProgressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: DETAIL_TRACK,
    overflow: "hidden",
  },
  detailProgressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  detailTranscriptWrap: {
    flex: 1,
  },
  detailTranscriptContent: {
    paddingBottom: 32,
  },
  detailTranscript: {
    color: "#cfcfcf",
    fontSize: 17,
    lineHeight: 28,
    fontFamily: FONTS.regular,
    fontStyle: "italic",
  },
});
