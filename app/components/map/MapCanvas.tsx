import { useEffect, useMemo, useRef } from "react";
import {
  Camera,
  CircleLayer,
  FillLayer,
  LineLayer,
  MapView,
  ShapeSource,
  SymbolLayer,
  UserLocation,
} from "@rnmapbox/maps";
import { RIT_CAMPUS_STYLE_JSON } from "@/lib/mapboxStyle";
import { LocationGeometryResponse, MapPoiRecord } from "@/types/map";
import {
  buildFeatureCollection,
  buildMapPoiFeatureCollection,
  buildRouteFeatureCollection,
  isValidBounds,
  isValidCoordinate,
} from "@/lib/map/mapGeometry";
import {
  CAMERA_CONFIG,
  CameraCommand,
  MAP_SCREEN_CONFIG,
  POI_ZOOM_BUCKETS,
  RouteLineFeature,
} from "@/lib/map/mapModels";
import {
  buildPoiMinZoomBucketFilter,
  buildUnifiedPoiLayerStyle,
} from "@/lib/map/mapStyleConfig";

export default function MapCanvas({
  mapPois,
  selectedGeometry,
  routeFeature,
  userCoordinate,
  locationTrackingEnabled,
  cameraCommand,
  mapStyleURL,
  onUserLocationUpdate,
}: Readonly<{
  mapPois: MapPoiRecord[];
  selectedGeometry: LocationGeometryResponse | null;
  routeFeature: RouteLineFeature | null;
  userCoordinate: [number, number] | null;
  locationTrackingEnabled: boolean;
  cameraCommand: CameraCommand | null;
  mapStyleURL: string | null;
  onUserLocationUpdate: (coordinate: [number, number]) => void;
}>) {
  const cameraRef = useRef<Camera>(null);
  const selectedFeatures = useMemo(
    () => selectedGeometry?.features ?? [],
    [selectedGeometry],
  );
  const mapPoiFeatureCollection = useMemo(
    () => buildMapPoiFeatureCollection(mapPois),
    [mapPois],
  );
  const selectedFeatureCollection = useMemo(
    () => buildFeatureCollection(selectedFeatures),
    [selectedFeatures],
  );
  const routeFeatureCollection = useMemo(
    () => buildRouteFeatureCollection(routeFeature),
    [routeFeature],
  );

  useEffect(() => {
    if (!cameraCommand) {
      return;
    }

    if ("bounds" in cameraCommand) {
      if (!isValidBounds(cameraCommand.bounds)) {
        return;
      }

      cameraRef.current?.fitBounds(
        cameraCommand.bounds.southWest,
        cameraCommand.bounds.northEast,
        cameraCommand.padding ?? CAMERA_CONFIG.selectedBoundsPadding,
        CAMERA_CONFIG.fitBoundsDurationMs,
      );
      return;
    }

    if (!isValidCoordinate(cameraCommand.centerCoordinate)) {
      return;
    }

    cameraRef.current?.setCamera({
      centerCoordinate: cameraCommand.centerCoordinate,
      zoomLevel: cameraCommand.zoomLevel ?? CAMERA_CONFIG.selectedLocationZoom,
      animationDuration: CAMERA_CONFIG.setCameraDurationMs,
    });
  }, [cameraCommand]);

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL={mapStyleURL ?? undefined}
      styleJSON={mapStyleURL ? undefined : RIT_CAMPUS_STYLE_JSON}
    >
      <Camera
        ref={cameraRef}
        centerCoordinate={[
          MAP_SCREEN_CONFIG.defaultCenter.longitude,
          MAP_SCREEN_CONFIG.defaultCenter.latitude,
        ]}
        zoomLevel={CAMERA_CONFIG.defaultZoom}
        animationMode="none"
        animationDuration={0}
      />
      {locationTrackingEnabled ? (
        <UserLocation
          visible
          minDisplacement={5}
          showsUserHeadingIndicator
          onUpdate={(location) => {
            onUserLocationUpdate([
              location.coords.longitude,
              location.coords.latitude,
            ]);
          }}
        />
      ) : null}
      <ShapeSource id="map-poi-source" shape={mapPoiFeatureCollection}>
        {POI_ZOOM_BUCKETS.map((bucket) => (
          <SymbolLayer
            key={bucket.id}
            id={bucket.id}
            minZoomLevel={bucket.minZoomLevel}
            filter={buildPoiMinZoomBucketFilter(
              bucket.bucketMinZoom,
              "bucketMaxZoom" in bucket ? bucket.bucketMaxZoom : undefined,
            )}
            style={buildUnifiedPoiLayerStyle()}
          />
        ))}
      </ShapeSource>

      {routeFeature ? (
        <ShapeSource id="walking-route-source" shape={routeFeatureCollection}>
          <LineLayer
            id="walking-route-line-outline"
            style={{
              lineColor: "#ffffff",
              lineWidth: 8,
              lineOpacity: 0.8,
            }}
          />
          <LineLayer
            id="walking-route-line"
            style={{
              lineColor: "#2563eb",
              lineWidth: 5,
              lineOpacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </ShapeSource>
      ) : null}

      {selectedFeatures.length > 0 ? (
        <ShapeSource
          id="selected-location-source"
          shape={selectedFeatureCollection}
        >
          <FillLayer
            id="selected-location-fill"
            style={{
              fillColor: "#f97316",
              fillOpacity: 0.18,
            }}
          />
          <LineLayer
            id="selected-location-line"
            style={{
              lineColor: "#ea580c",
              lineWidth: 3,
            }}
          />
          <CircleLayer
            id="selected-location-point"
            style={{
              circleColor: "#ea580c",
              circleRadius: 7,
              circleStrokeWidth: 2,
              circleStrokeColor: "#ffffff",
            }}
          />
        </ShapeSource>
      ) : null}

      {userCoordinate ? (
        <ShapeSource
          id="user-location-source"
          shape={{
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: userCoordinate,
                },
                properties: {},
              },
            ],
          }}
        >
          <CircleLayer
            id="user-location-ring"
            style={{
              circleColor: "rgba(59,130,246,0.2)",
              circleRadius: 14,
            }}
          />
          <CircleLayer
            id="user-location-point"
            style={{
              circleColor: "#2563eb",
              circleRadius: 6,
              circleStrokeColor: "#ffffff",
              circleStrokeWidth: 2,
            }}
          />
        </ShapeSource>
      ) : null}
    </MapView>
  );
}
