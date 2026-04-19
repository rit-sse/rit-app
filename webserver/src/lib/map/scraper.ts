import { ScrapeCache } from "../../db/cache";
import { RawLocation, RawLocationFeature } from "../../types/locations";

const scrapeCache = new ScrapeCache();
const MAP_LOCATIONS_CACHE_KEY = "map_locations_raw";

function getLocationFeaturesCacheKey(mdoId: number): string {
  return `map_location_features_${mdoId}`;
}

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

export async function fetchLocationFeaturesByMdoId(
  mdoId: number,
): Promise<RawLocationFeature[]> {
  const cacheKey = getLocationFeaturesCacheKey(mdoId);

  if (
    (await scrapeCache.inCache(cacheKey)) &&
    !(await scrapeCache.isExpired(cacheKey))
  ) {
    const cached = await scrapeCache.getCache(cacheKey);
    return (cached.data as RawLocationFeature[]) || [];
  }

  const response = await fetch(
    `https://mapserver.rit.edu/api/locations?mdo_id=${mdoId}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch location features for mdo_id=${mdoId}: ${response.status}`,
    );
  }

  const features = (await response.json()) as RawLocationFeature[];
  await scrapeCache.setCache(cacheKey, features);
  return features;
}
