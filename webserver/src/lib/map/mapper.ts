import {
  Bounds,
  Location,
  RawLocation,
  RawLocationFeature,
  LocationSearchRecord,
  MapBootstrapResponse,
  LocationFeature,
  LocationGeometryResponse,
  Position,
} from "../../types/locations";
import { fetchLocationFeaturesByMdoId, fetchLocations } from "./scraper";

// Normalizes search text by trimming whitespace, converting to lowercase, and collapsing multiple spaces into one
function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
// Builds a secondary label for a location by combining available details like abbreviation, building number, and room number
function buildSecondaryLabel(loc: Location): string | null {
  const parts = [loc.abbreviation, loc.buildingNumber, loc.roomNumber].filter(
    Boolean,
  );

  return parts.length > 0 ? parts.join(" ") : null;
}

// Builds a list of search tokens for a location, including various combinations of its name, abbreviation, building number, and room number
function buildSearchTokens(loc: Location): string[] {
  const rawTokens = [
    loc.name,
    loc.abbreviation,
    loc.buildingNumber,
    loc.roomNumber,
    [loc.abbreviation, loc.buildingNumber].filter(Boolean).join(" "),
    [loc.abbreviation, loc.roomNumber].filter(Boolean).join(" "),
    [loc.buildingNumber, loc.roomNumber].filter(Boolean).join(" "),
  ];

  return Array.from(
    new Set(
      rawTokens
        .filter((token): token is string => Boolean(token))
        .map(normalizeSearchText),
    ),
  );
}

// Maps raw location data from the API to a more structured Location type used in the application
function mapRawLocation(loc: RawLocation): Location {
  return {
    id: loc.id,
    mdoId: loc.mdo_id,
    name: loc.name,
    descShort: loc.descShort,
    abbreviation: loc.abbreviation,
    buildingNumber: loc.buildingNumber,
    roomNumber: loc.roomNumber,
    webLink: loc.webLink,
    isSearchable: loc.isSearchable,
    geometryId: loc.geometry_id,
  };
}

function mapRawLocationFeature(feature: RawLocationFeature): LocationFeature {
  return {
    type: feature.type,
    geometry: feature.geometry,
    properties: {
      id: feature.properties.id,
      mdoId: feature.properties.mdo_id,
      name: feature.properties.name,
      abbreviation: feature.properties.abbreviation ?? null,
      buildingNumber: feature.properties.buildingNumber ?? null,
      roomNumber: feature.properties.roomNumber ?? null,
      isSearchable: feature.properties.isSearchable,
      geometryId: feature.properties.geometry_id,
      menus: feature.properties.menus ?? [],
    },
  };
}

function flattenGeometryPositions(feature: LocationFeature): Position[] {
  switch (feature.geometry.type) {
    case "Point":
      return [feature.geometry.coordinates];
    case "Polygon":
      return feature.geometry.coordinates.flat();
    case "MultiPolygon":
      return feature.geometry.coordinates.flat(2);
  }
}

function getFeatureBounds(feature: LocationFeature): Bounds | null {
  const positions = flattenGeometryPositions(feature);
  if (positions.length === 0) {
    return null;
  }

  let minLon = positions[0][0];
  let minLat = positions[0][1];
  let maxLon = positions[0][0];
  let maxLat = positions[0][1];

  for (const [lon, lat] of positions) {
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

function getBoundsCenter(bounds: Bounds): Position {
  return [
    (bounds.southWest[0] + bounds.northEast[0]) / 2,
    (bounds.southWest[1] + bounds.northEast[1]) / 2,
  ];
}

function mergeBounds(boundsList: Bounds[]): Bounds | null {
  if (boundsList.length === 0) {
    return null;
  }

  let minLon = boundsList[0].southWest[0];
  let minLat = boundsList[0].southWest[1];
  let maxLon = boundsList[0].northEast[0];
  let maxLat = boundsList[0].northEast[1];

  for (const bounds of boundsList.slice(1)) {
    minLon = Math.min(minLon, bounds.southWest[0]);
    minLat = Math.min(minLat, bounds.southWest[1]);
    maxLon = Math.max(maxLon, bounds.northEast[0]);
    maxLat = Math.max(maxLat, bounds.northEast[1]);
  }

  return {
    southWest: [minLon, minLat],
    northEast: [maxLon, maxLat],
  };
}

function getFeatureLabelPoint(feature: LocationFeature): Position | null {
  if (feature.geometry.type === "Point") {
    return feature.geometry.coordinates;
  }

  const bounds = getFeatureBounds(feature);
  return bounds ? getBoundsCenter(bounds) : null;
}

function getLocationBounds(features: LocationFeature[]): Bounds | null {
  const boundsList = features
    .map(getFeatureBounds)
    .filter((bounds): bounds is Bounds => bounds !== null);

  return mergeBounds(boundsList);
}

function getLocationLabelPoint(features: LocationFeature[]): Position | null {
  if (features[0]?.geometry.type === "Point") {
    return features[0].geometry.coordinates;
  }

  const bounds = getLocationBounds(features);
  return bounds ? getBoundsCenter(bounds) : null;
}

// Main function to get structured location data, which first fetches raw data (with caching) and then maps it to the Location type
export async function getLocations(): Promise<Location[]> {
  const rawLocations = await fetchLocations();
  return rawLocations.map(mapRawLocation);
}

// Builds a LocationSearchRecord from a Location, which includes search tokens for efficient searching and display labels
function buildLocationSearchRecord(loc: Location): LocationSearchRecord {
  return {
    mdoId: loc.mdoId,
    name: loc.name,
    abbreviation: loc.abbreviation,
    buildingNumber: loc.buildingNumber,
    roomNumber: loc.roomNumber,
    primaryLabel: loc.name,
    secondaryLabel: buildSecondaryLabel(loc),
    searchTokens: buildSearchTokens(loc),
  };
}

// Main function to get searchable location records, which filters locations to only those marked as searchable and then builds search records for them
export async function getSearchableLocations(): Promise<
  LocationSearchRecord[]
> {
  const locations = await getLocations();
  return locations
    .filter((loc) => loc.isSearchable)
    .map(buildLocationSearchRecord);
}

export async function getMapBootstrapData(): Promise<
  Pick<MapBootstrapResponse, "locations" | "searchRecords">
> {
  const locations = await getLocations();
  const searchRecords = locations
    .filter((loc) => loc.isSearchable)
    .map(buildLocationSearchRecord);

  return {
    locations,
    searchRecords,
  };
}

export async function getLocationFeaturesByMdoId(
  mdoId: number,
): Promise<LocationFeature[]> {
  const rawFeatures = await fetchLocationFeaturesByMdoId(mdoId);
  return rawFeatures.map(mapRawLocationFeature);
}

export async function getLocationGeometryByMdoId(
  mdoId: number,
): Promise<LocationGeometryResponse> {
  const features = await getLocationFeaturesByMdoId(mdoId);

  return {
    mdoId,
    features,
    labelPoint: getLocationLabelPoint(features),
    bounds: getLocationBounds(features),
  };
}
