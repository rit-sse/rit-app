import { ScrapeCache } from "@/db/cache";
import { Request, Response } from "express";

const scrapeCache = new ScrapeCache();

async function fetchLocations() {
  // If cache exists and is recent (within 1 hour), return cached data
  if (
    (await scrapeCache.inCache("locations")) &&
    !(await scrapeCache.isExpired("locations"))
  ) {
    return await scrapeCache.getCache("locations");
  } else {
    // Otherwise, fetch new data and update cache
    const response = await fetch("https://mapserver.rit.edu/api/locations");
    const locations = await response.json();
    await scrapeCache.setCache("locations", locations);
    return locations;
  }
}

// GET /locations

export async function GET(req: Request, res: Response) {
  try {
    // Fetch locations from mapserver.rit.edu
    const locations = await fetchLocations();
    res.send({ data: locations });
  } catch (err) {
    res.status(500).send({
      error: "Failed to fetch locations",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
