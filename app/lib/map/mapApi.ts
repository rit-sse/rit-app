import { buildApiUrl } from "@/lib/api";
import {
  LocationGeometryResponse,
  MapBootstrapResponse,
} from "@/types/map";
import {
  MAP_SCREEN_CONFIG,
  RouteState,
} from "@/lib/map/mapModels";

const MAPBOX_PUBLIC_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

export async function fetchMapBootstrap(): Promise<MapBootstrapResponse> {
  const response = await fetch(buildApiUrl("/map/bootstrap"));
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message ?? "Unable to load map data.");
  }

  return json as MapBootstrapResponse;
}

export async function fetchLocationGeometry(
  mdoId: number,
): Promise<LocationGeometryResponse> {
  const response = await fetch(buildApiUrl(`/map/location/${mdoId}`));
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message ?? "Unable to load location geometry.");
  }

  return json as LocationGeometryResponse;
}

export async function fetchWalkingRoute(
  origin: [number, number],
  destination: [number, number],
): Promise<RouteState> {
  if (!MAPBOX_PUBLIC_ACCESS_TOKEN) {
    throw new Error(
      "Mapbox token missing. Add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN.",
    );
  }

  const params = new URLSearchParams({
    access_token: MAPBOX_PUBLIC_ACCESS_TOKEN,
    alternatives: "false",
    geometries: "geojson",
    overview: "full",
    steps: "false",
  });

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/walking/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?${params.toString()}`,
  );
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message ?? "Unable to load walking directions.");
  }

  const route = json.routes?.[0];

  if (!route?.geometry?.coordinates?.length) {
    throw new Error("No walking route found for this destination.");
  }

  return {
    feature: {
      type: "Feature",
      geometry: route.geometry,
      properties: {
        distanceMeters: route.distance ?? 0,
        durationSeconds: route.duration ?? 0,
      },
    },
    distanceMeters: route.distance ?? 0,
    durationSeconds: route.duration ?? 0,
  };
}

export { MAP_SCREEN_CONFIG };
