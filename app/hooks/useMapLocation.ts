import { useState } from "react";
import { Linking, Platform } from "react-native";
import { requestAndroidLocationPermissions } from "@rnmapbox/maps";

export function useMapLocation(
  setMapErrorMessage: (message: string | null) => void,
) {
  const [userCoordinate, setUserCoordinate] = useState<[number, number] | null>(
    null,
  );
  const [isLocationTrackingEnabled, setIsLocationTrackingEnabled] =
    useState(false);
  const [hasRequestedLocationPermission, setHasRequestedLocationPermission] =
    useState(false);

  const openDeviceSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      setMapErrorMessage(
        "Enable location access in system settings to use your live position.",
      );
    }
  };

  const ensureLocationPermission = async (): Promise<boolean> => {
    if (isLocationTrackingEnabled) {
      return true;
    }

    setHasRequestedLocationPermission(true);

    if (Platform.OS === "android") {
      try {
        const granted = await requestAndroidLocationPermissions();

        if (!granted) {
          setMapErrorMessage(
            "Location permission was denied. Enable it in system settings to use live position and walking directions.",
          );
          return false;
        }

        setIsLocationTrackingEnabled(true);
        setMapErrorMessage("Waiting for your current location...");
        return true;
      } catch {
        setMapErrorMessage(
          "Unable to request Android location permission right now.",
        );
        return false;
      }
    }

    setIsLocationTrackingEnabled(true);
    setMapErrorMessage(
      "Allow location access when prompted to use live position.",
    );
    return true;
  };

  return {
    userCoordinate,
    setUserCoordinate,
    isLocationTrackingEnabled,
    hasRequestedLocationPermission,
    ensureLocationPermission,
    openDeviceSettings,
  };
}
