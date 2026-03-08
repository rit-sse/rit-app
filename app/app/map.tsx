import React, {memo, useCallback, useEffect, useRef, useState} from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from "react-native";
import {LeafletView, WebviewLeafletMessage} from "react-native-leaflet-view";
import {useFocusEffect} from "@react-navigation/native";
import {Asset} from "expo-asset";
import {File} from "expo-file-system";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import DragUp from "./DragUp";
import GearIcon from "../components/svgs/map/GearIcon";
import BusIcon from "../components/svgs/map/BusIcon";
import BuildingIcon from "../components/svgs/map/BuildingIcon";

import {buildApiUrl} from "@/lib/api";
import {ActiveRoute, RouteLiveSummary} from "@/types/bus";

const buttonWidth = 70;
const buttonSpacing = 15;
const iconStyle = {height: 0.65 * buttonWidth, width: 0.65 * buttonWidth};
const DEFAULT_LOCATION = {
  latitude: 43.083,
  longitude: -77.676,
};
const ROUTE_POLL_MS = 30000;
const ROUTE_SUMMARY_FRESH_MS = 15000;

const allButtonStyling: StyleProp<ViewStyle> = {
  position: "absolute",
  width: buttonWidth,
  height: buttonWidth,
  backgroundColor: "#FFF",
  borderRadius: 14,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowRadius: 3.84,
  shadowOffset: {width: 0, height: 2},
  elevation: 5,
};

function onMapMessage(message: WebviewLeafletMessage) {
  return message;
}

type RouteSelectorProps = {
  routes: ActiveRoute[];
  selectedRouteId: string | null;
  onRouteSelect: (routeId: string) => void;
  keyPrefix?: string;
};

const RouteSelector = memo(function RouteSelector({
  routes,
  selectedRouteId,
  onRouteSelect,
  keyPrefix = "",
}: Readonly<RouteSelectorProps>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routeList}>
      {routes.map((route) => {
        const routeId = route.route.rId;
        const isSelected = routeId === selectedRouteId;
        return (
          <Pressable
            key={`${keyPrefix}${routeId}`}
            onPress={() => {
              void onRouteSelect(routeId);
            }}
            style={[styles.routeButton, isSelected && styles.routeButtonSelected]}
          >
            <Text style={[styles.routeButtonText, isSelected && styles.routeButtonTextSelected]}>{route.route.routeName}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

function LeafletMap({onMapMessage: onMapMessageProp}: {onMapMessage: (message: WebviewLeafletMessage) => unknown}) {
  const [webViewContent, setWebViewContent] = useState<string | null>(null);

  useEffect(() => {
      let isAlive = true;

      const loadHtml = async () => {
        try {
          const path = require("../assets/leaflet.html");
          const asset = Asset.fromModule(path);
          await asset.downloadAsync();
          const htmlContent = await new File(asset.localUri!).text();

          if (isAlive) {
            setWebViewContent(htmlContent);
          }
        } catch {
          Alert.alert("Error loading map", "Unable to load map content.");
        }
      };

      void loadHtml();

      return () => {
        isAlive = false;
      };
    }, []);

  if (!webViewContent) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <LeafletView
      source={{html: webViewContent}}
      mapCenterPosition={{
        lat: DEFAULT_LOCATION.latitude,
        lng: DEFAULT_LOCATION.longitude,
      }}
      onMessageReceived={onMapMessageProp}
      doDebug={false}
    />
  );
}

async function fetchActiveRoutes(): Promise<ActiveRoute[]> {
  const response = await fetch(buildApiUrl("/bus/live"));
  if (!response.ok) {
    throw new Error("Failed to load active shuttle routes.");
  }

  const json = await response.json();
  return json.data ?? [];
}

async function fetchRouteSummary(routeId: string): Promise<RouteLiveSummary> {
  const response = await fetch(buildApiUrl("/bus/liveSummary", {routeId}));
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message ?? "Unable to load route details.");
  }

  return json.data;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const navBarClearance = 115;
  const [routes, setRoutes] = useState<ActiveRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [summary, setSummary] = useState<RouteLiveSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [trackerVisible] = useState(false);
  const [buildingModalVisible, setBuildingModalVisible] = useState(false);
  const selectedRouteIdRef = useRef<string | null>(null);
  const summaryFreshnessRef = useRef<{routeId: string; loadedAt: number} | null>(null);

  useEffect(() => {
    selectedRouteIdRef.current = selectedRouteId;
  }, [selectedRouteId]);

  useFocusEffect(
    useCallback(() => {
      let isAlive = true;

      const refresh = async () => {
        try {
          const activeRoutes = await fetchActiveRoutes();
          if (!isAlive) {
            return;
          }

          setRoutes(activeRoutes);
          setErrorMessage(null);

          const selectedRoute = selectedRouteIdRef.current;
          const hasSelectedRoute = selectedRoute && activeRoutes.some((route) => route.route.rId === selectedRoute);
          if (!hasSelectedRoute) {
            setSelectedRouteId(null);
            setSummary(null);
            summaryFreshnessRef.current = null;
            setIsLoading(false);
            return;
          }

          const freshness = summaryFreshnessRef.current;
          const summaryStillFresh = freshness && freshness.routeId === selectedRoute && Date.now() - freshness.loadedAt < ROUTE_SUMMARY_FRESH_MS;
          if (summaryStillFresh) {
            setIsLoading(false);
            return;
          }

          const routeSummary = await fetchRouteSummary(selectedRoute);
          if (!isAlive) {
            return;
          }

          setSummary(routeSummary);
          summaryFreshnessRef.current = {routeId: selectedRoute, loadedAt: Date.now()};
        } catch (err) {
          if (!isAlive) {
            return;
          }

          setErrorMessage(err instanceof Error ? err.message : "Unexpected error while loading shuttle data.");
        } finally {
          if (isAlive) {
            setIsLoading(false);
          }
        }
      };

      void refresh();
      const pollTimer = setInterval(() => {
        void refresh();
      }, ROUTE_POLL_MS);

      return () => {
        isAlive = false;
        clearInterval(pollTimer);
      };
    }, []),
  );

  const onRouteSelect = useCallback(async (routeId: string) => {
    setSelectedRouteId(routeId);
    selectedRouteIdRef.current = routeId;
    setErrorMessage(null);

    try {
      const routeSummary = await fetchRouteSummary(routeId);
      setSummary(routeSummary);
      summaryFreshnessRef.current = {routeId, loadedAt: Date.now()};
    } catch (err) {
      setSummary(null);
      summaryFreshnessRef.current = null;
      setErrorMessage(err instanceof Error ? err.message : "Unable to load route details.");
    }
  }, []);

  return (
    <View style={styles.screen}>
      <LeafletMap onMapMessage={onMapMessage} />

      <View style={styles.buttonsColumn}>
        <View style={[{bottom: 2 * (buttonWidth + buttonSpacing)}, allButtonStyling]}>
          <GearIcon onPress={() => {}} style={iconStyle} fill="#000" />
        </View>

        <View style={[{bottom: buttonWidth + buttonSpacing}, allButtonStyling]}>
          <BusIcon onPress={() => setBuildingModalVisible(true)} style={iconStyle} fill="#000" />
        </View>

        <View style={[{bottom: 0}, allButtonStyling]}>
          <BuildingIcon onPress={() => setBuildingModalVisible(true)} style={iconStyle} fill="#000" />
        </View>
      </View>

      {trackerVisible && !buildingModalVisible && (
        <View style={styles.panel}>
          <Text style={styles.title}>Shuttle Tracker</Text>

          {isLoading && <Text style={styles.infoText}>Loading shuttle data...</Text>}
          {!isLoading && routes.length === 0 && <Text style={styles.infoText}>No active shuttles right now.</Text>}
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          {routes.length > 0 && (
            <RouteSelector routes={routes} selectedRouteId={selectedRouteId} onRouteSelect={onRouteSelect} />
          )}

          {summary && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{summary.routeName}</Text>
              <Text style={styles.summaryLine}>Coming from: {summary.fromStop}</Text>
              <Text style={styles.summaryLine}>Going to: {summary.toStop}</Text>
              <Text style={styles.summaryLine}>Expected: {summary.etaMinutes} min</Text>
            </View>
          )}
        </View>
      )}

      <DragUp visible={buildingModalVisible} setVisible={setBuildingModalVisible} bottomOffset={Math.max(navBarClearance, insets.bottom + 24)}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bus Schedule</Text>
            <Pressable onPress={() => setBuildingModalVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseLabel}>X</Text>
            </Pressable>
          </View>

          {selectedRouteId && summary ? (
            <View style={styles.modalCard}>
              <Text style={styles.modalRouteName}>{summary.routeName}</Text>
              <Text style={styles.modalLine}>Pickup: {summary.fromStop}</Text>
              <Text style={styles.modalLine}>Stop: {summary.toStop}</Text>
              <Text style={styles.modalLine}>Next bus in {summary.etaMinutes} min</Text>
            </View>
          ) : (
            <Text style={styles.modalSubtitle}>Select a shuttle route from the tracker panel to view schedule details here.</Text>
          )}

          {routes.length > 0 && (
            <View style={styles.modalRouteStrip}>
              <Text style={styles.modalSectionTitle}>Active Routes</Text>
              <RouteSelector routes={routes} selectedRouteId={selectedRouteId} onRouteSelect={onRouteSelect} keyPrefix="modal-" />
            </View>
          )}
        </View>
      </DragUp>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },
  buttonsColumn: {
    position: "absolute",
    bottom: 35 + 80 + buttonSpacing,
    right: "5%",
    width: buttonWidth,
    height: 3 * buttonWidth + 2 * buttonSpacing,
  },
  panel: {
    position: "absolute",
    bottom: 78,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e6e6e6",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#171717",
    marginBottom: 8,
  },
  infoText: {
    color: "#4d4d4d",
    marginBottom: 8,
  },
  errorText: {
    color: "#b42318",
    marginBottom: 8,
  },
  routeList: {
    gap: 8,
    paddingVertical: 8,
  },
  routeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dadada",
    backgroundColor: "#fafafa",
  },
  routeButtonSelected: {
    backgroundColor: "#f76902",
    borderColor: "#f76902",
  },
  routeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2f2f2f",
  },
  routeButtonTextSelected: {
    color: "#ffffff",
  },
  summaryCard: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ececec",
    backgroundColor: "#fcfcfc",
    padding: 12,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#171717",
    marginBottom: 4,
  },
  summaryLine: {
    fontSize: 14,
    color: "#333333",
  },
  modalContent: {
    width: "100%",
    height: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  modalHandle: {
    height: 6,
    width: 50,
    backgroundColor: "#bababa",
    borderRadius: 5,
    marginBottom: 14,
    alignSelf: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#171717",
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#d8d8d8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  modalCloseLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2b2b2b",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  modalCard: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ececec",
    backgroundColor: "#fcfcfc",
    padding: 12,
    gap: 4,
  },
  modalRouteName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#171717",
    marginBottom: 4,
  },
  modalLine: {
    fontSize: 14,
    color: "#2f2f2f",
  },
  modalRouteStrip: {
    marginTop: 10,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4d4d4d",
    marginBottom: 6,
  },
});
