export type RouteLineFeature = {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties: {
    distanceMeters: number;
    durationSeconds: number;
  };
};

export type RouteState = {
  feature: RouteLineFeature;
  distanceMeters: number;
  durationSeconds: number;
};

export type CameraCommand =
  | {
      key: number;
      centerCoordinate: [number, number];
      zoomLevel?: number;
    }
  | {
      key: number;
      bounds: {
        southWest: [number, number];
        northEast: [number, number];
      };
      padding?: number;
    };

export const MAP_SCREEN_CONFIG = {
  defaultCenter: {
    latitude: 43.083,
    longitude: -77.676,
  },
  busRefreshIntervalMs: 60_000,
  searchResultsLimit: 8,
} as const;

export const FLOATING_ACTION_LAYOUT = {
  buttonWidth: 70,
  buttonSpacing: 15,
  iconSize: {
    height: 0.65 * 70,
    width: 0.65 * 70,
  },
  floatingButtonClassName:
    "absolute h-[70px] w-[70px] items-center justify-center rounded-[14px] bg-white shadow",
} as const;

export const CAMERA_CONFIG = {
  defaultZoom: 14,
  selectedLocationZoom: 17,
  locateMeZoom: 16,
  firstUserZoom: 15.5,
  selectedBoundsPadding: 100,
  routeBoundsPadding: 110,
  fitBoundsDurationMs: 900,
  setCameraDurationMs: 900,
} as const;

export const POI_ZOOM_BUCKETS = [
  { id: "poi-z13", minZoomLevel: 13, bucketMinZoom: 0, bucketMaxZoom: 13.5 },
  { id: "poi-z13.5", minZoomLevel: 13.5, bucketMinZoom: 13.5, bucketMaxZoom: 14 },
  { id: "poi-z14", minZoomLevel: 14, bucketMinZoom: 14, bucketMaxZoom: 14.5 },
  { id: "poi-z14.5", minZoomLevel: 14.5, bucketMinZoom: 14.5, bucketMaxZoom: 15 },
  { id: "poi-z15", minZoomLevel: 15, bucketMinZoom: 15, bucketMaxZoom: 15.5 },
  { id: "poi-z15.5", minZoomLevel: 15.5, bucketMinZoom: 15.5, bucketMaxZoom: 16 },
  { id: "poi-z16", minZoomLevel: 16, bucketMinZoom: 16, bucketMaxZoom: 16.5 },
  { id: "poi-z16.5", minZoomLevel: 16.5, bucketMinZoom: 16.5, bucketMaxZoom: 17 },
  { id: "poi-z17", minZoomLevel: 17, bucketMinZoom: 17, bucketMaxZoom: 18 },
  { id: "poi-z18", minZoomLevel: 18, bucketMinZoom: 18 },
] as const;
