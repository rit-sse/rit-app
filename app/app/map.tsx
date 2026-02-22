import {useCallback, useState} from "react";
import {Pressable, ScrollView, StyleSheet, Text, View} from "react-native";
import MapView, {Marker} from "react-native-maps";
import {useFocusEffect} from "@react-navigation/native";
import {buildApiUrl} from "@/lib/api";
import {ActiveRoute, RouteLiveSummary} from "@/types/bus";

const RIT_REGION = {
  latitude: 43.0848,
  longitude: -77.6742,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

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
      <MapView style={styles.map} initialRegion={RIT_REGION}>
        {summary && (
          <Marker
            coordinate={{latitude: summary.marker.lat, longitude: summary.marker.lon}}
            title={summary.routeName}
            description={`Coming from ${summary.fromStop}`}
          />
        )}
      </MapView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },
  map: {
    flex: 1,
  },
  panel: {
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
});
