import React, { useCallback } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { usePushNotifications } from "./src/hooks/usePushNotifications";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore duplicate/pre-init calls in development.
});
SplashScreen.setOptions({
  duration: 250,
  fade: true,
});

function AppContent() {
  usePushNotifications();
  return <HomeScreen />;
}

export default function App() {
  const onLayoutRootView = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {
      // Ignore hide failures during hot reloads.
    });
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <AppContent />
      </View>
    </SafeAreaProvider>
  );
}
