import { Request, Response } from "express";
import { ScrapeCache } from "../../../db/cache";
import { getRoutesFromCacheOrScrape } from "@/lib/bus/liveData";

const scrapeCache = new ScrapeCache();

/**
 * GET /bus
 *
 * Returns all scraped RIT shuttle schedules.
 */
export async function GET(req: Request, res: Response) {
  try {
    const routes = await getRoutesFromCacheOrScrape(scrapeCache);

    res.send({
      data: routes,
    });
  } catch (err) {
    res.status(500).send({
      error: "Failed to fetch bus schedules",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
