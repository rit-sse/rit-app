import { ScrapeCache } from "../../db/cache";
import {
  Location,
  RawLocation,
  LocationSearchRecord,
} from "../../types/locations";

const scrapeCache = new ScrapeCache();

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

// Fetches raw location data from the RIT map server API, with caching to reduce load and improve performance
async function fetchLocations(): Promise<RawLocation[]> {
  // If cache exists and is recent (within 1 hour), return cached data
  if (
    (await scrapeCache.inCache("map_locations_raw")) &&
    !(await scrapeCache.isExpired("map_locations_raw"))
  ) {
    const cached = await scrapeCache.getCache("map_locations_raw");
    return (cached.data as RawLocation[]) || [];
  } else {
    // Otherwise, fetch new data and update cache
    const response = await fetch("https://mapserver.rit.edu/api/locations");

    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.status}`);
    }

    const locations = (await response.json()) as RawLocation[];
    await scrapeCache.setCache("map_locations_raw", locations);
    return locations;
  }
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
