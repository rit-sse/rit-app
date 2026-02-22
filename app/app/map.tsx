import {useCallback, useState} from "react";
import {Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle} from "react-native";
import {WebviewLeafletMessage} from "react-native-leaflet-view";
import {useFocusEffect} from "@react-navigation/native";

import Map from "./map/Map";
import DragUp from "./DragUp";
import GearIcon from "../components/svgs/map/GearIcon";
import BusIcon from "../components/svgs/map/BusIcon";
import BuildingIcon from "../components/svgs/map/BuildingIcon";

import {buildApiUrl} from "@/lib/api";
import {ActiveRoute, RouteLiveSummary} from "@/types/bus";

const buttonWidth = 70;
const buttonSpacing = 15;
const iconStyle = {height: 0.65 * buttonWidth, width: 0.65 * buttonWidth};

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
  const [routes, setRoutes] = useState<ActiveRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [summary, setSummary] = useState<RouteLiveSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [trackerVisible, setTrackerVisible] = useState(true);
  const [buildingModalVisible, setBuildingModalVisible] = useState(false);

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

          const hasSelectedRoute = selectedRouteId && activeRoutes.some((route) => route.route.rId === selectedRouteId);
          if (!hasSelectedRoute) {
            setSelectedRouteId(null);
            setSummary(null);
            setIsLoading(false);
            return;
          }

          const routeSummary = await fetchRouteSummary(selectedRouteId);
          if (!isAlive) {
            return;
          }

          setSummary(routeSummary);
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
      }, 30000);

      return () => {
        isAlive = false;
        clearInterval(pollTimer);
      };
    }, [selectedRouteId]),
  );

  const onRouteSelect = async (routeId: string) => {
    setSelectedRouteId(routeId);
    setErrorMessage(null);

    try {
      const routeSummary = await fetchRouteSummary(routeId);
      setSummary(routeSummary);
    } catch (err) {
      setSummary(null);
      setErrorMessage(err instanceof Error ? err.message : "Unable to load route details.");
    }
  };

  return (
    <View style={styles.screen}>
      <Map onMapMessage={onMapMessage} />

      <View style={styles.buttonsColumn}>
        <View style={[{bottom: 2 * (buttonWidth + buttonSpacing)}, allButtonStyling]}>
          <GearIcon onPress={() => {}} style={iconStyle} fill="#000" />
        </View>

        <View style={[{bottom: buttonWidth + buttonSpacing}, allButtonStyling]}>
          <BusIcon onPress={() => setTrackerVisible((prev) => !prev)} style={iconStyle} fill="#000" />
        </View>

        <View style={[{bottom: 0}, allButtonStyling]}>
          <BuildingIcon onPress={() => setBuildingModalVisible(true)} style={iconStyle} fill="#000" />
        </View>
      </View>

      {trackerVisible && (
        <View style={styles.panel}>
          <Text style={styles.title}>Shuttle Tracker</Text>

          {isLoading && <Text style={styles.infoText}>Loading shuttle data...</Text>}
          {!isLoading && routes.length === 0 && <Text style={styles.infoText}>No active shuttles right now.</Text>}
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          {routes.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routeList}>
              {routes.map((route) => {
                const isSelected = route.route.rId === selectedRouteId;
                return (
                  <Pressable
                    key={route.route.rId}
                    onPress={() => {
                      void onRouteSelect(route.route.rId);
                    }}
                    style={[styles.routeButton, isSelected && styles.routeButtonSelected]}
                  >
                    <Text style={[styles.routeButtonText, isSelected && styles.routeButtonTextSelected]}>{route.route.routeName}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
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

      <DragUp getVisible={() => buildingModalVisible} setVisible={setBuildingModalVisible}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Buildings</Text>
          <Text style={styles.modalSubtitle}>Building explorer from map branch is wired; data hookup can be added next.</Text>
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
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#555",
  },
});
