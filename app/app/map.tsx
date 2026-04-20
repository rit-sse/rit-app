import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Mapbox from "@rnmapbox/maps";
import GLOBAL from "./globals";
import { MapBootstrapResponse } from "@/types/map";
import MapCanvas from "@/components/map/MapCanvas";
import MapSearchOverlay from "@/components/map/MapSearchOverlay";
import MapFloatingActions from "@/components/map/MapFloatingActions";
import TransitSheet from "@/components/map/TransitSheet";
import { CAMERA_CONFIG } from "@/lib/map/mapModels";
import { isValidCoordinate } from "@/lib/map/mapGeometry";
import { useMapLocation } from "@/hooks/useMapLocation";
import { useBusRoutes } from "@/hooks/useBusRoutes";
import { useMapSelection } from "@/hooks/useMapSelection";

const MAPBOX_PUBLIC_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";
const CUSTOM_MAPBOX_STYLE_URL =
  process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL?.trim() || null;

Mapbox.setAccessToken(MAPBOX_PUBLIC_ACCESS_TOKEN);

export default function MapScreen() {
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [mapBootstrap, setMapBootstrap] = useState<MapBootstrapResponse | null>(
    null,
  );
  const [mapErrorMessage, setMapErrorMessage] = useState<string | null>(null);
  const hasCenteredOnUserRef = useRef(false);
  const location = useMapLocation(setMapErrorMessage);
  const selection = useMapSelection(
    mapBootstrap,
    setMapBootstrap,
    setMapErrorMessage,
    location.ensureLocationPermission,
    location.userCoordinate,
  );
  const bus = useBusRoutes(scheduleVisible);
  const { loadMapBootstrap, setCameraCommand } = selection;

  const centerOnUser = () => {
    void (async () => {
      const permissionReady = await location.ensureLocationPermission();

      if (!permissionReady) {
        return;
      }

      if (!location.userCoordinate) {
        setMapErrorMessage("Waiting for your current location...");
        return;
      }

      setMapErrorMessage(null);
      selection.setCameraCommand({
        key: Date.now(),
        centerCoordinate: location.userCoordinate,
        zoomLevel: CAMERA_CONFIG.locateMeZoom,
      });
    })();
  };

  useEffect(() => {
    void loadMapBootstrap();
  }, [loadMapBootstrap]);

  useEffect(() => {
    if (
      !location.isLocationTrackingEnabled ||
      !location.userCoordinate ||
      hasCenteredOnUserRef.current
    ) {
      return;
    }

    hasCenteredOnUserRef.current = true;
    setCameraCommand({
      key: Date.now(),
      centerCoordinate: location.userCoordinate,
      zoomLevel: CAMERA_CONFIG.firstUserZoom,
    });
  }, [location.isLocationTrackingEnabled, location.userCoordinate, setCameraCommand]);

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
    <View className="flex-1 bg-[#f5f6f8]">
      <MapCanvas
        mapPois={mapBootstrap?.mapPois ?? []}
        selectedGeometry={selection.selectedGeometry}
        routeFeature={selection.walkingRoute?.feature ?? null}
        userCoordinate={location.userCoordinate}
        locationTrackingEnabled={location.isLocationTrackingEnabled}
        cameraCommand={selection.cameraCommand}
        mapStyleURL={CUSTOM_MAPBOX_STYLE_URL}
        onUserLocationUpdate={(coordinate) => {
          if (isValidCoordinate(coordinate)) {
            location.setUserCoordinate(coordinate);
            setMapErrorMessage(null);
          }
        }}
      />

      <MapSearchOverlay
        searchQuery={selection.searchQuery}
        setSearchQuery={selection.setSearchQuery}
        isSearchFocused={selection.isSearchFocused}
        setIsSearchFocused={selection.setIsSearchFocused}
        isMapLoading={selection.isMapLoading}
        isSelectingLocation={selection.isSelectingLocation}
        shouldShowSearchResults={selection.shouldShowSearchResults}
        filteredSearchRecords={selection.filteredSearchRecords}
        selectedSearchMdoId={selection.selectedSearchMdoId}
        onSelectRecord={(record) => {
          void selection.focusSearchRecord(record);
        }}
        mapErrorMessage={mapErrorMessage}
        showOpenSettings={
          location.hasRequestedLocationPermission && !location.userCoordinate
        }
        onOpenSettings={() => {
          void location.openDeviceSettings();
        }}
        selectedGeometry={selection.selectedGeometry}
        selectedLocationTitle={selection.selectedLocationTitle}
        routeSummaryText={selection.routeSummaryText}
        selectedRecord={selection.selectedRecord}
        isRouting={selection.isRouting}
        onStartWalkingRoute={() => {
          void selection.startWalkingRoute();
        }}
        onLocateMe={() => {
          selection.setWalkingRoute(null);
          centerOnUser();
        }}
        onClearSelection={selection.clearSelection}
      />

      <MapFloatingActions
        canOpenBus={!bus.isBusLoading && bus.routeItems.length > 0}
        onOpenBus={() => {
          if (!bus.isBusLoading && bus.routeItems.length > 0) {
            setScheduleVisible(true);
          }
        }}
        onLocateMe={centerOnUser}
        onFocusSearch={() => {
          selection.setIsSearchFocused(true);
        }}
      />

      <TransitSheet
        visible={scheduleVisible}
        setVisible={(visible) => {
          setScheduleVisible(visible);
          if (!visible) {
            bus.setSelectedStopName(null);
          }
        }}
        isBusRefreshing={bus.isBusRefreshing}
        onRefresh={() => {
          void bus.loadRoutes({ refreshing: true });
        }}
        isBusLoading={bus.isBusLoading}
        busErrorMessage={bus.busErrorMessage}
        routeItems={bus.routeItems}
        selectedRouteId={bus.selectedRouteId}
        onSelectRoute={(routeId) => {
          bus.setSelectedRouteId(routeId);
          bus.setSelectedStopName(null);
          const routeItem = bus.routeItems.find((item) => item.routeId === routeId);
          void selection.focusStopOnMap(
            routeItem?.nextStopName ?? routeItem?.currentStopName ?? null,
          );
        }}
        selectedDetail={bus.selectedDetail}
        onSelectStop={(stopName) => {
          bus.setSelectedStopName(stopName);
          void selection.focusStopOnMap(stopName);
        }}
      />
    </View>
  );
}
