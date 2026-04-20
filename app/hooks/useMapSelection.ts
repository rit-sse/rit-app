import { useCallback, useMemo, useState } from "react";
import {
  LocationGeometryResponse,
  LocationSearchRecord,
  MapBootstrapResponse,
} from "@/types/map";
import { fetchLocationGeometry, fetchMapBootstrap, fetchWalkingRoute } from "@/lib/map/mapApi";
import { findSearchRecordForStop, getSearchScore } from "@/lib/map/mapSearch";
import { CameraCommand, CAMERA_CONFIG, RouteState, MAP_SCREEN_CONFIG } from "@/lib/map/mapModels";
import { formatDistance, formatDuration, getBoundsFromCoordinates } from "@/lib/map/mapGeometry";

export function useMapSelection(
  mapBootstrap: MapBootstrapResponse | null,
  setMapBootstrap: (bootstrap: MapBootstrapResponse | null) => void,
  setMapErrorMessage: (message: string | null) => void,
  ensureLocationPermission: () => Promise<boolean>,
  userCoordinate: [number, number] | null,
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedGeometry, setSelectedGeometry] =
    useState<LocationGeometryResponse | null>(null);
  const [selectedRecord, setSelectedRecord] =
    useState<LocationSearchRecord | null>(null);
  const [walkingRoute, setWalkingRoute] = useState<RouteState | null>(null);
  const [selectedSearchMdoId, setSelectedSearchMdoId] = useState<number | null>(
    null,
  );
  const [cameraCommand, setCameraCommand] = useState<CameraCommand | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  const filteredSearchRecords = useMemo(() => {
    if (!mapBootstrap || searchQuery.trim() === "") {
      return [];
    }

    return [...mapBootstrap.searchRecords]
      .map((record) => ({
        record,
        score: getSearchScore(record, searchQuery),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.record.primaryLabel.localeCompare(b.record.primaryLabel);
      })
      .slice(0, MAP_SCREEN_CONFIG.searchResultsLimit)
      .map((item) => item.record);
  }, [mapBootstrap, searchQuery]);

  const shouldShowSearchResults =
    isSearchFocused &&
    searchQuery.trim().length > 0 &&
    filteredSearchRecords.length > 0;

  const selectedLocationTitle = selectedRecord?.primaryLabel ?? searchQuery;
  const routeSummaryText = walkingRoute
    ? `${formatDistance(walkingRoute.distanceMeters)} • ${formatDuration(
        walkingRoute.durationSeconds,
      )}`
    : null;

  const loadMapBootstrap = useCallback(async () => {
    setIsMapLoading(true);

    try {
      const bootstrap = await fetchMapBootstrap();
      setMapBootstrap(bootstrap);
      setMapErrorMessage(null);
    } catch (error) {
      setMapErrorMessage(
        error instanceof Error
          ? error.message
          : "Unexpected error loading map data.",
      );
    } finally {
      setIsMapLoading(false);
    }
  }, [setMapBootstrap, setMapErrorMessage]);

  const focusSearchRecord = async (record: LocationSearchRecord) => {
    setIsSelectingLocation(true);
    setSelectedSearchMdoId(record.mdoId);
    setSelectedRecord(record);
    setSearchQuery(record.primaryLabel);
    setIsSearchFocused(false);

    try {
      const geometry = await fetchLocationGeometry(record.mdoId);
      setSelectedGeometry(geometry);
      setWalkingRoute(null);
      setMapErrorMessage(null);

      if (geometry.bounds) {
        setCameraCommand({
          key: Date.now(),
          bounds: geometry.bounds,
          padding: CAMERA_CONFIG.selectedBoundsPadding,
        });
      } else if (geometry.labelPoint) {
        setCameraCommand({
          key: Date.now(),
          centerCoordinate: geometry.labelPoint,
          zoomLevel: CAMERA_CONFIG.selectedLocationZoom,
        });
      }
    } catch (error) {
      setMapErrorMessage(
        error instanceof Error
          ? error.message
          : "Unexpected error loading location geometry.",
      );
    } finally {
      setIsSelectingLocation(false);
    }
  };

  const focusStopOnMap = async (stopName: string | null) => {
    if (!stopName || !mapBootstrap) {
      return;
    }

    const matchedRecord = findSearchRecordForStop(
      stopName,
      mapBootstrap.searchRecords,
    );

    if (!matchedRecord) {
      setMapErrorMessage(`No map match found for stop "${stopName}".`);
      return;
    }

    await focusSearchRecord(matchedRecord);
  };

  const startWalkingRoute = async () => {
    if (!selectedGeometry?.labelPoint) {
      setMapErrorMessage("Choose a destination before starting directions.");
      return;
    }

    const permissionReady = await ensureLocationPermission();

    if (!permissionReady) {
      return;
    }

    if (!userCoordinate) {
      setMapErrorMessage("Waiting for your current location...");
      return;
    }

    setIsRouting(true);

    try {
      const route = await fetchWalkingRoute(
        userCoordinate,
        selectedGeometry.labelPoint,
      );
      setWalkingRoute(route);
      setMapErrorMessage(null);

      const routeBounds = getBoundsFromCoordinates(
        route.feature.geometry.coordinates,
      );

      if (routeBounds) {
        setCameraCommand({
          key: Date.now(),
          bounds: routeBounds,
          padding: CAMERA_CONFIG.routeBoundsPadding,
        });
      }
    } catch (error) {
      setMapErrorMessage(
        error instanceof Error
          ? error.message
          : "Unexpected error loading directions.",
      );
    } finally {
      setIsRouting(false);
    }
  };

  const clearSelection = () => {
    setSelectedSearchMdoId(null);
    setSelectedRecord(null);
    setSelectedGeometry(null);
    setWalkingRoute(null);
    setSearchQuery("");
  };

  return {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    selectedGeometry,
    selectedRecord,
    walkingRoute,
    selectedSearchMdoId,
    cameraCommand,
    setCameraCommand,
    isRouting,
    isMapLoading,
    isSelectingLocation,
    filteredSearchRecords,
    shouldShowSearchResults,
    selectedLocationTitle,
    routeSummaryText,
    loadMapBootstrap,
    focusSearchRecord,
    focusStopOnMap,
    startWalkingRoute,
    clearSelection,
    setWalkingRoute,
  };
}
