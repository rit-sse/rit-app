import { ScrapeCache } from "../../db/cache";
import { RawLocation } from "../../types/locations";

const scrapeCache = new ScrapeCache();
const MAP_LOCATIONS_CACHE_KEY = "map_locations_raw";

export async function fetchLocations(): Promise<RawLocation[]> {
  if (
    (await scrapeCache.inCache(MAP_LOCATIONS_CACHE_KEY)) &&
    !(await scrapeCache.isExpired(MAP_LOCATIONS_CACHE_KEY))
  ) {
    const cached = await scrapeCache.getCache(MAP_LOCATIONS_CACHE_KEY);
    return (cached.data as RawLocation[]) || [];
  }

  const response = await fetch("https://mapserver.rit.edu/api/locations");

  if (!response.ok) {
    throw new Error(`Failed to fetch locations: ${response.status}`);
  }

  const locations = (await response.json()) as RawLocation[];
  await scrapeCache.setCache(MAP_LOCATIONS_CACHE_KEY, locations);
  return locations;
}
