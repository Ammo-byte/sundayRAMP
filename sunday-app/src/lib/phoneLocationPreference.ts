import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const USE_PHONE_LOCATION_KEY = "sunday.usePhoneLocation";

export async function getPhoneLocationEnabledPreference(): Promise<boolean> {
  const storedValue = await AsyncStorage.getItem(USE_PHONE_LOCATION_KEY);
  return storedValue === "true";
}

export async function setPhoneLocationEnabledPreference(enabled: boolean): Promise<void> {
  if (enabled) {
    await AsyncStorage.setItem(USE_PHONE_LOCATION_KEY, "true");
    return;
  }

  await AsyncStorage.removeItem(USE_PHONE_LOCATION_KEY);
}

export async function requestPhoneLocationAccess(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  const existing = await Location.getForegroundPermissionsAsync();
  if (existing.granted) {
    return {
      granted: true,
      canAskAgain: existing.canAskAgain,
    };
  }

  const requested = await Location.requestForegroundPermissionsAsync();
  return {
    granted: requested.granted,
    canAskAgain: requested.canAskAgain,
  };
}

export async function getPhoneLocationPermissionState(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  const existing = await Location.getForegroundPermissionsAsync();
  return {
    granted: existing.granted,
    canAskAgain: existing.canAskAgain,
  };
}
