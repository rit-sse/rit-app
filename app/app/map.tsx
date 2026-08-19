import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ComponentType,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ActivityIndicator,
  Platform,
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
import { NamedBuilding } from "@/types/buildings";
import BusIcon from "../components/svgs/map/BusIcon";
import BuildingIcon from "../components/svgs/map/BuildingIcon";
import BuildingRow from "@/components/map/BuildingRow";
import BuildingCard from "@/components/map/BuildingCard";

const MAPBOX_PUBLIC_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

Mapbox.setAccessToken(MAPBOX_PUBLIC_ACCESS_TOKEN);

// This project's tsc resolves @rnmapbox/maps through its web type stub (no
// `moduleSuffixes` configured), which doesn't declare ShapeSource/LineLayer/
// locationManager/requestAndroidLocationPermissions — even though they exist
// on the real native module at runtime (the default export is just the full
// namespace: `import * as Mapbox from './Mapbox'`). Cast locally so the rest
// of this file stays type-checked against the real API shape.
type RouteGeometry = { type: "LineString"; coordinates: [number, number][] };
type LocationListener = (location: {
  coords: { latitude: number; longitude: number };
}) => void;

const RNMapbox = Mapbox as unknown as typeof Mapbox & {
  ShapeSource: ComponentType<{
    id: string;
    shape: RouteGeometry;
    children?: ReactNode;
  }>;
  LineLayer: ComponentType<{
    id: string;
    style?: {
      lineColor?: string;
      lineWidth?: number;
      lineCap?: string;
      lineJoin?: string;
    };
  }>;
  locationManager: {
    start: () => void;
    stop: () => void;
    addListener: (listener: LocationListener) => void;
    removeListener: (listener: LocationListener) => void;
  };
  requestAndroidLocationPermissions: () => Promise<boolean>;
};

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

type MapCameraRef = ComponentRef<typeof Camera>;

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

async function fetchNamedBuildings(): Promise<NamedBuilding[]> {
  const response = await fetch(buildApiUrl("/named-buildings/"));
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message ?? "Unable to load buildings.");
  }

  return json.data ?? [];
}

const LOCATION_TIMEOUT_MS = 8_000;

async function getCurrentCoordinate(): Promise<[number, number] | null> {
  if (Platform.OS === "android") {
    const granted = await RNMapbox.requestAndroidLocationPermissions();
    if (!granted) {
      return null;
    }
  }

  return new Promise((resolve) => {
    const listener: LocationListener = (location) => {
      clearTimeout(timeoutId);
      RNMapbox.locationManager.removeListener(listener);
      resolve([location.coords.longitude, location.coords.latitude]);
    };

    const timeoutId = setTimeout(() => {
      RNMapbox.locationManager.removeListener(listener);
      resolve(null);
    }, LOCATION_TIMEOUT_MS);

    RNMapbox.locationManager.addListener(listener);
    RNMapbox.locationManager.start();
  });
}

async function fetchWalkingRoute(
  origin: [number, number],
  destination: [number, number],
): Promise<RouteGeometry> {
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&overview=full&access_token=${MAPBOX_PUBLIC_ACCESS_TOKEN}`;
  const response = await fetch(url);
  const json = await response.json();
  const geometry = json?.routes?.[0]?.geometry;

  if (!response.ok || !geometry) {
    throw new Error(json.message ?? "Unable to find a walking route.");
  }

  return geometry;
}

function MapboxMap({
  cameraRef,
  selectedBuilding,
  routeGeoJSON,
}: {
  cameraRef: RefObject<MapCameraRef | null>;
  selectedBuilding: NamedBuilding | null;
  routeGeoJSON: RouteGeometry | null;
}) {
  return (
    <MapView style={styles.map} scaleBarEnabled={false}>
      <Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: [
            DEFAULT_LOCATION.longitude,
            DEFAULT_LOCATION.latitude,
          ],
          zoomLevel: 14,
        }}
      />
      {selectedBuilding?.latitude != null && selectedBuilding?.longitude != null && (
        <Mapbox.MarkerView
          coordinate={[selectedBuilding.longitude, selectedBuilding.latitude]}
        >
          <View style={styles.buildingPin} />
        </Mapbox.MarkerView>
      )}
      {routeGeoJSON && (
        <RNMapbox.ShapeSource id="routeSource" shape={routeGeoJSON}>
          <RNMapbox.LineLayer
            id="routeLine"
            style={{
              lineColor: "#f76902",
              lineWidth: 4,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </RNMapbox.ShapeSource>
      )}
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

  const [buildings, setBuildings] = useState<NamedBuilding[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState(true);
  const [buildingsRefreshing, setBuildingsRefreshing] = useState(false);
  const [buildingsError, setBuildingsError] = useState<string | null>(null);
  const [buildingsVisible, setBuildingsVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<NamedBuilding | null>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<RouteGeometry | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const isFetchingBuildingsRef = useRef(false);
  const cameraRef = useRef<MapCameraRef>(null);

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

  const loadBuildings = async ({
    refreshing = false,
  }: {
    refreshing?: boolean;
  } = {}) => {
    if (isFetchingBuildingsRef.current) {
      return;
    }

    isFetchingBuildingsRef.current = true;

    if (refreshing) {
      setBuildingsRefreshing(true);
    } else {
      setBuildingsLoading(true);
    }

    try {
      const nextBuildings = await fetchNamedBuildings();
      setBuildings(nextBuildings);
      setBuildingsError(null);
    } catch (error) {
      setBuildingsError(
        error instanceof Error
          ? error.message
          : "Unexpected error loading buildings.",
      );
    } finally {
      isFetchingBuildingsRef.current = false;
      setBuildingsLoading(false);
      setBuildingsRefreshing(false);
    }
  };

  useEffect(() => {
    if (buildingsVisible && buildings.length === 0) {
      void loadBuildings();
    }
  }, [buildingsVisible]);

  const handleSelectBuilding = (building: NamedBuilding) => {
    if (building.latitude == null || building.longitude == null) {
      return;
    }

    setSelectedBuilding(building);
    setBuildingsVisible(false);
    setRouteGeoJSON(null);
    setRouteError(null);
    cameraRef.current?.setCamera({
      centerCoordinate: [building.longitude, building.latitude],
      zoomLevel: 18,
      animationDuration: 1200,
      animationMode: "flyTo",
    });
  };

  const handleCloseCard = () => {
    setSelectedBuilding(null);
    setRouteGeoJSON(null);
    setRouteError(null);
  };

  const handleRouteToBuilding = async () => {
    if (
      !selectedBuilding ||
      selectedBuilding.latitude == null ||
      selectedBuilding.longitude == null ||
      routeLoading
    ) {
      return;
    }

    setRouteLoading(true);
    setRouteError(null);

    try {
      const origin = await getCurrentCoordinate();
      if (!origin) {
        setRouteError("Unable to get your location.");
        return;
      }

      const destination: [number, number] = [
        selectedBuilding.longitude,
        selectedBuilding.latitude,
      ];
      const geometry = await fetchWalkingRoute(origin, destination);
      setRouteGeoJSON(geometry);

      const lons = geometry.coordinates.map((c) => c[0]);
      const lats = geometry.coordinates.map((c) => c[1]);
      cameraRef.current?.fitBounds(
        [Math.max(...lons), Math.max(...lats)],
        [Math.min(...lons), Math.min(...lats)],
        60,
        1000,
      );
    } catch (error) {
      setRouteError(
        error instanceof Error ? error.message : "Unable to find a route.",
      );
    } finally {
      setRouteLoading(false);
    }
  };

  useEffect(() => {
    const shouldHideNavbar = scheduleVisible || buildingsVisible;
    GLOBAL.showNavbar?.(!shouldHideNavbar);
    GLOBAL.navbar?.setState({ navBarVisibility: !shouldHideNavbar });

    return () => {
      GLOBAL.showNavbar?.(true);
      GLOBAL.navbar?.setState({ navBarVisibility: true });
    };
  }, [scheduleVisible, buildingsVisible]);

  return (
    <View style={styles.screen}>
      <MapboxMap
        cameraRef={cameraRef}
        selectedBuilding={selectedBuilding}
        routeGeoJSON={routeGeoJSON}
      />

      {selectedBuilding && (
        <BuildingCard
          building={selectedBuilding}
          onClose={handleCloseCard}
          onRouteTo={() => void handleRouteToBuilding()}
          routeLoading={routeLoading}
          routeError={routeError}
        />
      )}

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
              setScheduleVisible(true);
            }}
            style={iconStyle}
            fill="#000"
          />
        </View>

        <View style={[{ bottom: 0 }, allButtonStyling]}>
          <BuildingIcon
            onPress={() => setBuildingsVisible(true)}
            style={iconStyle}
            fill="#000"
          />
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

      <DragUp
        visible={buildingsVisible}
        setVisible={setBuildingsVisible}
        bottomOffset={0}
        heightPercent={78}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={buildingsRefreshing}
              onRefresh={() => {
                void loadBuildings({ refreshing: true });
              }}
              tintColor="#f76902"
            />
          }
        >
          <Text style={styles.title}>Buildings</Text>

          {buildingsLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color="#f76902" />
              <Text style={styles.stateText}>Loading buildings...</Text>
            </View>
          ) : buildingsError ? (
            <View style={styles.centerState}>
              <Text style={styles.errorText}>{buildingsError}</Text>
            </View>
          ) : (
            buildings.map((building) => (
              <BuildingRow
                key={building.link || building.name}
                building={building}
                onSelect={handleSelectBuilding}
              />
            ))
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
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  buildingPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f76902",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  buttonsColumn: {
    position: "absolute",
    bottom: 35 + 80 + buttonSpacing,
    right: "5%",
    width: buttonWidth,
    height: 3 * buttonWidth + 2 * buttonSpacing,
    zIndex: 10,
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
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
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
