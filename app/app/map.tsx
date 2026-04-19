import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Mapbox, { Camera, MapView } from "@rnmapbox/maps";
import DragUp from "./DragUp";
import GLOBAL from "./globals";
import { buildApiUrl } from "@/lib/api";
import ActiveRouteList from "@/components/bus/ActiveRouteList";
import RouteCard from "@/components/bus/RouteCard";
import StopsGrid from "@/components/bus/StopsGrid";
import { buildActiveRouteList, buildRouteDetail } from "@/components/bus/model";
import { ActiveRoute, ActiveRouteListItem } from "@/types/bus";
import BusIcon from "../components/svgs/map/BusIcon";
import BuildingIcon from "../components/svgs/map/BuildingIcon";

const MAPBOX_PUBLIC_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

Mapbox.setAccessToken(MAPBOX_PUBLIC_ACCESS_TOKEN);

const buttonWidth = 70;
const buttonSpacing = 15;
const iconStyle = { height: 0.65 * buttonWidth, width: 0.65 * buttonWidth };
const DEFAULT_LOCATION = {
  latitude: 43.083,
  longitude: -77.676,
};

// const RIT_CAMPUS_BOUNDS = {
//   northEast: { latitude: 43.11894, longitude: -77.74673 },
//   southWest: { latitude: 43.04571, longitude: -77.60746 },

// }

const BUS_REFRESH_INTERVAL_MS = 60_000;

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
  shadowOffset: { width: 0, height: 2 },
  elevation: 5,
};

async function fetchActiveRoutes(): Promise<ActiveRoute[]> {
  const response = await fetch(buildApiUrl("/bus/live"));
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message ?? "Unable to load bus data.");
  }

  return json.data ?? [];
}

function MapboxMap() {
  return (
    <MapView style={{ flex: 1 }}>
      <Camera
        centerCoordinate={[
          DEFAULT_LOCATION.longitude,
          DEFAULT_LOCATION.latitude,
        ]}
        // maxBounds={{
        //   ne: [RIT_CAMPUS_BOUNDS.northEast.longitude, RIT_CAMPUS_BOUNDS.northEast.latitude],
        //   sw: [RIT_CAMPUS_BOUNDS.southWest.longitude, RIT_CAMPUS_BOUNDS.southWest.latitude],
        // }}
        zoomLevel={14}
        animationMode="none"
        animationDuration={0}
      />
    </MapView>
  );
}

export default function MapScreen() {
  const [routes, setRoutes] = useState<ActiveRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopName, setSelectedStopName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const isFetchingRef = useRef(false);

  const routeItems = useMemo<ActiveRouteListItem[]>(
    () => buildActiveRouteList(routes),
    [routes],
  );

  const selectedDetail = useMemo(
    () =>
      selectedRouteId
        ? buildRouteDetail(selectedRouteId, routes, selectedStopName)
        : null,
    [routes, selectedRouteId, selectedStopName],
  );

  const loadRoutes = async ({
    refreshing = false,
    silent = false,
  }: {
    refreshing?: boolean;
    silent?: boolean;
  } = {}) => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    if (refreshing) {
      setIsRefreshing(true);
    } else if (!silent) {
      setIsLoading(true);
    }

    try {
      const nextRoutes = await fetchActiveRoutes();
      const nextRouteItems = buildActiveRouteList(nextRoutes);

      setRoutes(nextRoutes);
      setErrorMessage(null);

      setSelectedRouteId((current) => {
        if (
          current &&
          nextRouteItems.some((item) => item.routeId === current)
        ) {
          return current;
        }
        return nextRouteItems[0]?.routeId ?? null;
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unexpected error loading bus data.",
      );
    } finally {
      isFetchingRef.current = false;

      if (!silent) {
        setIsLoading(false);
      }

      if (refreshing) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    void loadRoutes();
  }, []);

  useEffect(() => {
    if (!scheduleVisible) {
      return;
    }

    void loadRoutes({ silent: true });

    const intervalId = setInterval(() => {
      void loadRoutes({ silent: true });
    }, BUS_REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [scheduleVisible]);

  useEffect(() => {
    const shouldHideNavbar = scheduleVisible;
    GLOBAL.showNavbar?.(!shouldHideNavbar);
    GLOBAL.navbar?.setState({ navBarVisibility: !shouldHideNavbar });

    return () => {
      GLOBAL.showNavbar?.(true);
      GLOBAL.navbar?.setState({ navBarVisibility: true });
    };
  }, [scheduleVisible]);

  return (
    <View style={styles.screen}>
      {/* <LeafletMap onMapMessage={onMapMessage} /> */}
      <MapboxMap />

      <View style={styles.buttonsColumn}>
        {/* <View
          style={[
            { bottom: 2 * (buttonWidth + buttonSpacing) },
            allButtonStyling,
          ]}
        >
          <GearIcon onPress={() => {}} style={iconStyle} fill="#000" />
        </View> */}

        <View
          style={[{ bottom: buttonWidth + buttonSpacing }, allButtonStyling]}
        >
          <BusIcon
            onPress={() => {
              if (!isLoading && routeItems.length > 0) {
                setScheduleVisible(true);
              }
            }}
            style={iconStyle}
            fill="#000"
          />
        </View>

        <View style={[{ bottom: 0 }, allButtonStyling]}>
          <BuildingIcon onPress={() => {}} style={iconStyle} fill="#000" />
        </View>
      </View>

      <DragUp
        visible={scheduleVisible}
        setVisible={(visible) => {
          setScheduleVisible(visible);
          if (!visible) {
            setSelectedStopName(null);
          }
        }}
        bottomOffset={0}
        heightPercent={78}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                void loadRoutes({ refreshing: true });
              }}
              tintColor="#f76902"
            />
          }
        >
          <Text style={styles.kicker}>RIT Transit | Bus Schedule</Text>

          {isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color="#f76902" />
              <Text style={styles.stateText}>Loading active routes...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.centerState}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : routeItems.length === 0 ? (
            <View style={styles.centerState}>
              <Text style={styles.stateTitle}>No active routes right now.</Text>
              <Text style={styles.stateText}>
                Pull down to refresh when buses are back in service.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Routes</Text>
                <ActiveRouteList
                  items={routeItems}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={(routeId) => {
                    setSelectedRouteId(routeId);
                    setSelectedStopName(null);
                  }}
                />
              </View>

              {selectedDetail && (
                <View style={styles.detailSection}>
                  <RouteCard detail={selectedDetail} />
                  <StopsGrid
                    detail={selectedDetail}
                    onSelectStop={setSelectedStopName}
                  />
                </View>
              )}
            </>
          )}
        </ScrollView>
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
  content: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 48,
    gap: 20,
  },
  hero: {
    backgroundColor: "#fff8f1",
    borderRadius: 24,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  kicker: {
    color: "#c2410c",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "800",
    fontSize: 12,
  },
  title: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    gap: 12,
  },
  detailSection: {
    gap: 18,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
  },
  centerState: {
    minHeight: 220,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 10,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  stateText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
  errorText: {
    fontSize: 15,
    color: "#b91c1c",
    textAlign: "center",
    lineHeight: 22,
  },
});
