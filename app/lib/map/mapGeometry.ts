import { LocationFeature, MapPoiRecord } from "@/types/map";

export function isValidCoordinate(
  coordinate: [number, number] | null | undefined,
): coordinate is [number, number] {
  return (
    Array.isArray(coordinate) &&
    coordinate.length === 2 &&
    typeof coordinate[0] === "number" &&
    Number.isFinite(coordinate[0]) &&
    typeof coordinate[1] === "number" &&
    Number.isFinite(coordinate[1])
  );
}

export function isValidBounds(
  bounds:
    | {
        southWest: [number, number];
        northEast: [number, number];
      }
    | null
    | undefined,
): bounds is {
  southWest: [number, number];
  northEast: [number, number];
} {
  return (
    !!bounds &&
    isValidCoordinate(bounds.southWest) &&
    isValidCoordinate(bounds.northEast)
  );
}

export function buildFeatureCollection(features: LocationFeature[]) {
  return {
    type: "FeatureCollection" as const,
    features,
  };
}

export function buildMapPoiFeatureCollection(pois: MapPoiRecord[]) {
  return {
    type: "FeatureCollection" as const,
    features: pois
      .filter((poi) => isValidCoordinate(poi.labelPoint))
      .map((poi) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: poi.labelPoint,
        },
        properties: {
          mdoId: poi.mdoId,
          name: poi.name,
          abbreviation: poi.abbreviation,
          buildingNumber: poi.buildingNumber,
          category: poi.category,
          minZoom: poi.minZoom,
          priority: poi.priority,
          placementSortKey: Math.max(0, 1000 - poi.priority),
        },
      })),
  };
}

export function buildRouteFeatureCollection(routeFeature: {
  type: "Feature";
  geometry: { type: "LineString"; coordinates: [number, number][] };
  properties: { distanceMeters: number; durationSeconds: number };
} | null) {
  return {
    type: "FeatureCollection" as const,
    features: routeFeature ? [routeFeature] : [],
  };
}

export function getBoundsFromCoordinates(
  coordinates: [number, number][],
): { southWest: [number, number]; northEast: [number, number] } | null {
  if (coordinates.length === 0) {
    return null;
  }

  let minLon = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLon = coordinates[0][0];
  let maxLat = coordinates[0][1];

  for (const [lon, lat] of coordinates) {
    minLon = Math.min(minLon, lon);
    minLat = Math.min(minLat, lat);
    maxLon = Math.max(maxLon, lon);
    maxLat = Math.max(maxLat, lat);
  }

  return {
    southWest: [minLon, minLat],
    northEast: [maxLon, maxLat],
  };
}

export function formatDistance(distanceMeters: number): string {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }

  return `${Math.round(distanceMeters)} m`;
}

export function formatDuration(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  return `${minutes} min`;
}
