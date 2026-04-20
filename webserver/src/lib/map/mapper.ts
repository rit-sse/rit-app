import {
  Bounds,
  Location,
  MapPoiCategory,
  MapPoiRecord,
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
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ");
}
// Builds a secondary label for a location by combining available details like abbreviation, building number, and room number
function buildSecondaryLabel(loc: Location): string | null {
  const parts = [loc.abbreviation, loc.buildingNumber, loc.roomNumber].filter(
    Boolean,
  );

  return parts.length > 0 ? parts.join(" • ") : null;
}

// Builds a list of search tokens for a location, including various combinations of its name, abbreviation, building number, and room number
function buildSearchTokens(loc: Location): string[] {
  const rawTokens = [
    loc.name,
    loc.abbreviation,
    loc.buildingNumber,
    loc.roomNumber,
    [loc.name, loc.abbreviation].filter(Boolean).join(" "),
    [loc.name, loc.buildingNumber].filter(Boolean).join(" "),
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
    descLong: loc.descLong,
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

function getFeatureArea(bounds: Bounds | null): number {
  if (!bounds) {
    return Number.POSITIVE_INFINITY;
  }

  return (
    (bounds.northEast[0] - bounds.southWest[0]) *
    (bounds.northEast[1] - bounds.southWest[1])
  );
}

function pickPrimaryFeature(
  features: LocationFeature[],
): LocationFeature | null {
  if (features.length === 0) {
    return null;
  }

  if (features.length === 1) {
    return features[0];
  }

  const polygonFeatures = features.filter(
    (feature) =>
      feature.geometry.type === "Polygon" ||
      feature.geometry.type === "MultiPolygon",
  );

  if (polygonFeatures.length > 0) {
    return polygonFeatures.reduce((best, current) =>
      getFeatureArea(getFeatureBounds(current)) <
      getFeatureArea(getFeatureBounds(best))
        ? current
        : best,
    );
  }

  return (
    features.find((feature) => feature.geometry.type === "Point") ?? features[0]
  );
}

function getLocationBounds(features: LocationFeature[]): Bounds | null {
  const boundsList = features
    .map(getFeatureBounds)
    .filter((bounds): bounds is Bounds => bounds !== null);

  return mergeBounds(boundsList);
}

function getLocationLabelPoint(features: LocationFeature[]): Position | null {
  const primaryFeature = pickPrimaryFeature(features);
  return primaryFeature ? getFeatureLabelPoint(primaryFeature) : null;
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

function shouldCreateAmbientLabel(loc: Location): boolean {
  return loc.isSearchable && loc.geometryId !== null && loc.roomNumber === null;
}

function normalizeMenus(menus: string[]): string[] {
  return menus.map(normalizeSearchText);
}

function matchesAny(value: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

const SUPPRESSED_AMBIENT_LABEL_PATTERNS = [
  /bike rack/i,
  /blue light/i,
  /accessible entrance/i,
  /designated tobacco/i,
  /construction/i,
  /hydration station/i,
  /vending/i,
  /lactation room/i,
  /higi kiosk/i,
  /aed/i,
  /chalk zone/i,
  /\blawn\b/i,
  /\brock\b/i,
  /trailhead/i,
  /info booth/i,
  /ambulance/i,
  /public skate/i,
  /game room/i,
  /parkmobile area/i,
  /^ucs\s*-/i,
  /^rka\s*-/i,
  /^pga\s*-/i,
  /^conference room/i,
] as const;

const DINING_NAME_PATTERNS = [
  /gracie'?s/i,
  /cafe/i,
  /grille/i,
  /market/i,
  /deli/i,
  /commons/i,
  /corner store/i,
  /beanz/i,
  /java'?s/i,
  /nathan'?s/i,
  /brick city/i,
  /cantina/i,
  /bakery/i,
  /ben\s*&\s*jerry/i,
  /concessions/i,
] as const;

const SERVICE_NAME_PATTERNS = [
  /^office of /i,
  /human resources/i,
  /public safety/i,
  /service center/i,
  /postal hub/i,
  /post office/i,
  /financial services/i,
  /financial aid/i,
  /admissions/i,
  /employment/i,
  /main office/i,
  /registrar/i,
  /residence halls association/i,
  /rotc office/i,
] as const;

const LANDMARK_NAME_PATTERNS = [
  /statue/i,
  /sundial/i,
  /quad/i,
  /plaza/i,
  /garden/i,
  /walk/i,
  /fountain/i,
  /sentinel/i,
  /unity/i,
  /sign/i,
  /labyrinth/i,
  /painted rocks/i,
] as const;

const ATHLETICS_NAME_PATTERNS = [
  /field house/i,
  /arena/i,
  /gymnasium/i,
  /aquatics/i,
  /fitness center/i,
  /field/i,
  /courts/i,
  /track/i,
] as const;

const BUILDING_NAME_PATTERNS = [
  /hall/i,
  /library/i,
  /center/i,
  /arena/i,
  /gymnasium/i,
  /union/i,
  /building/i,
  /house/i,
  /barn/i,
  /crossroads/i,
  /observatory/i,
  /marketplace/i,
] as const;

function buildLocationSearchCorpus(loc: Location): string {
  return normalizeSearchText(
    [loc.name, loc.descShort, loc.descLong, loc.webLink]
      .filter((value): value is string => Boolean(value))
      .join(" "),
  );
}

function isSuppressedAmbientLabel(loc: Location): boolean {
  return matchesAny(loc.name, [...SUPPRESSED_AMBIENT_LABEL_PATTERNS]);
}

function isDiningPoi(loc: Location, normalizedMenus: string[]): boolean {
  return (
    normalizedMenus.some((menu) => menu.includes("dining")) ||
    matchesAny(loc.name, [...DINING_NAME_PATTERNS]) ||
    loc.webLink?.includes("/dining/") === true
  );
}

function isParkingPoi(loc: Location, normalizedMenus: string[]): boolean {
  return (
    normalizedMenus.some(
      (menu) =>
        menu.includes("parking") ||
        menu.includes("lot") ||
        menu.includes("parkmobile"),
    ) ||
    /(^|\s)([a-z]|\w{1,2}) lot$/i.test(loc.name) ||
    /\blot\s+\d/i.test(loc.name) ||
    /business and technology park lot/i.test(loc.name) ||
    /parking lot/i.test(loc.descShort ?? "")
  );
}

function isBusStopPoi(loc: Location, normalizedMenus: string[]): boolean {
  return (
    normalizedMenus.some(
      (menu) => menu.includes("bus") || menu.includes("transit"),
    ) || /^bus stop/i.test(loc.name)
  );
}

function isEvChargingPoi(loc: Location): boolean {
  return /electric vehicle charging/i.test(loc.name);
}

function isServicePoi(loc: Location, normalizedMenus: string[]): boolean {
  return (
    normalizedMenus.some(
      (menu) =>
        menu.includes("public safety") ||
        menu.includes("emergency") ||
        menu.includes("service") ||
        menu.includes("support"),
    ) ||
    matchesAny(loc.name, [...SERVICE_NAME_PATTERNS])
  );
}

function isLandmarkPoi(loc: Location, normalizedMenus: string[]): boolean {
  return (
    normalizedMenus.some(
      (menu) =>
        menu.includes("art") ||
        menu.includes("museum") ||
        menu.includes("sculpture") ||
        menu.includes("plaza") ||
        menu.includes("quad") ||
        menu.includes("garden"),
    ) || matchesAny(loc.name, [...LANDMARK_NAME_PATTERNS])
  );
}

function isAthleticsPoi(loc: Location, normalizedMenus: string[]): boolean {
  return (
    normalizedMenus.some(
      (menu) =>
        menu.includes("athletic") ||
        menu.includes("fitness") ||
        menu.includes("recreation"),
    ) || matchesAny(loc.name, [...ATHLETICS_NAME_PATTERNS])
  );
}

function isPrimaryBuildingPoi(loc: Location): boolean {
  if (!loc.buildingNumber) {
    return false;
  }

  if (
    isSuppressedAmbientLabel(loc) ||
    matchesAny(loc.name, [...DINING_NAME_PATTERNS, ...SERVICE_NAME_PATTERNS])
  ) {
    return false;
  }

  const searchCorpus = buildLocationSearchCorpus(loc);

  return (
    matchesAny(loc.name, [...BUILDING_NAME_PATTERNS]) ||
    searchCorpus.includes("academic building") ||
    searchCorpus.includes("mixed use building") ||
    searchCorpus.includes("teaching and training facility") ||
    searchCorpus.includes("fitness center") ||
    searchCorpus.includes("student life center") ||
    searchCorpus.includes("home to")
  );
}

function classifyMapPoi(
  loc: Location,
  menus: string[],
):
  | Omit<
      MapPoiRecord,
      "mdoId" | "name" | "abbreviation" | "buildingNumber" | "menus" | "labelPoint"
    >
  | null {
  const normalizedMenus = normalizeMenus(menus);

  if (isSuppressedAmbientLabel(loc)) {
    return null;
  }

  if (isPrimaryBuildingPoi(loc)) {
    return {
      category: "building",
      iconName: "marker-stroked",
      minZoom: 13,
      priority: 120,
    };
  }

  if (isAthleticsPoi(loc, normalizedMenus)) {
    return {
      category: "culture",
      iconName: "music-15",
      minZoom: 14.75,
      priority: 88,
    };
  }

  if (isLandmarkPoi(loc, normalizedMenus)) {
    return {
      category: "culture",
      iconName: "music-15",
      minZoom: 15.1,
      priority: 76,
    };
  }

  if (isDiningPoi(loc, normalizedMenus)) {
    return {
      category: "dining",
      iconName: "restaurant-15",
      minZoom: 16.1,
      priority: 58,
    };
  }

  if (isServicePoi(loc, normalizedMenus)) {
    return {
      category: "service",
      iconName: "shop-15",
      minZoom: 16.2,
      priority: 54,
    };
  }

  if (isBusStopPoi(loc, normalizedMenus)) {
    return {
      category: "parkingTransit",
      iconName: "parking-15",
      minZoom: 16.7,
      priority: 38,
    };
  }

  if (isEvChargingPoi(loc)) {
    return {
      category: "parkingTransit",
      iconName: "parking-15",
      minZoom: 17.2,
      priority: 28,
    };
  }

  if (isParkingPoi(loc, normalizedMenus)) {
    return {
      category: "parkingTransit",
      iconName: "parking-15",
      minZoom: 15.8,
      priority: 42,
    };
  }

  if (loc.buildingNumber) {
    return {
      category: "building",
      iconName: "marker-stroked",
      minZoom: 14.2,
      priority: 96,
    };
  }

  return {
    category: "building",
    iconName: "marker-stroked",
    minZoom: 15.2,
    priority: 64,
  };
}

async function buildMapPoiRecord(
  loc: Location,
): Promise<MapPoiRecord | null> {
  const geometry = await getLocationGeometryByMdoId(loc.mdoId);

  if (!geometry.labelPoint) {
    return null;
  }

  const menus = Array.from(
    new Set(geometry.features.flatMap((feature) => feature.properties.menus)),
  );
  const classified = classifyMapPoi(loc, menus);

  if (!classified) {
    return null;
  }

  return {
    mdoId: loc.mdoId,
    name: loc.name,
    abbreviation: loc.abbreviation,
    buildingNumber: loc.buildingNumber,
    ...classified,
    menus,
    labelPoint: geometry.labelPoint,
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
  Pick<MapBootstrapResponse, "locations" | "searchRecords" | "mapPois">
> {
  const locations = await getLocations();
  const searchRecords = locations
    .filter((loc) => loc.isSearchable)
    .map(buildLocationSearchRecord);
  const mapPois = (
    await Promise.all(
      locations
        .filter(shouldCreateAmbientLabel)
        .map(buildMapPoiRecord),
    )
  ).filter((record): record is MapPoiRecord => record !== null);

  return {
    locations,
    searchRecords,
    mapPois,
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
