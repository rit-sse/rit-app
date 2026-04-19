import { ScrapeCache } from "@/db/cache";
import {
  Location,
  RawLocation,
  LocationSearchRecord,
} from "../../types/locations";

const scrapeCache = new ScrapeCache();

// Fetches raw location data from the RIT map server API, with caching to reduce load and improve performance
async function fetchLocations(): Promise<RawLocation[]> {
  // If cache exists and is recent (within 1 hour), return cached data
  if (
    (await scrapeCache.inCache("map_locations_raw")) &&
    !(await scrapeCache.isExpired("map_locations_raw"))
  ) {
    const cahed = await scrapeCache.getCache("map_locations_raw");
    return (cahed.data as RawLocation[]) || [];
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
  const searchTokens = [
    loc.name,
    loc.abbreviation,
    loc.buildingNumber,
    loc.roomNumber,
  ]
    .filter(Boolean)
    .map((s) => s!.toLowerCase());

  return {
    mdoId: loc.mdoId,
    name: loc.name,
    abbreviation: loc.abbreviation,
    buildingNumber: loc.buildingNumber,
    roomNumber: loc.roomNumber,
    primaryLabel: loc.name,
    secondaryLabel: [loc.buildingNumber, loc.roomNumber]
      .filter(Boolean)
      .join(" "),
    searchTokens,
  };
}

export async function getSearchableLocations(): Promise<
  LocationSearchRecord[]
> {
  const locations = await getLocations();
  return locations
    .filter((loc) => loc.isSearchable)
    .map(buildLocationSearchRecord);
}
