import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HomeScreen } from "./src/screens/HomeScreen";
import { usePushNotifications } from "./src/hooks/usePushNotifications";

function AppContent() {
  usePushNotifications();
  return <HomeScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
