import { Request, Response } from "express";
import { ScrapeCache } from "../../../db/cache";
import {
  buildRouteSummary,
  getActiveRoutes,
  getRoutesFromCacheOrScrape,
} from "../../../lib/bus/liveData";

const scrapeCache = new ScrapeCache();

/**
 * GET /bus/liveSummary?routeId=3
 *
 * Returns a slim live summary for one active route.
 */
export async function GET(req: Request, res: Response) {
  const routeId = req.query["routeId"]?.toString().trim();

  if (!routeId) {
    res.status(400).send({
      error: "MISSING_ROUTE_ID",
      message: "Query parameter 'routeId' is required.",
    });
    return;
  }

  try {
    const routes = await getRoutesFromCacheOrScrape(scrapeCache);
    const activeRoutes = getActiveRoutes(routes);
    const selectedRoute = activeRoutes.find(
      (route) => route.route.rId === routeId,
    );

    if (!selectedRoute) {
      res.status(404).send({
        error: "ROUTE_NOT_ACTIVE",
        message: `Route ${routeId} is not currently active.`,
      });
      return;
    }

    const summary = buildRouteSummary(selectedRoute);
    if (!summary) {
      res.status(404).send({
        error: "LIVE_SUMMARY_UNAVAILABLE",
        message: `No live summary available for route ${routeId}.`,
      });
      return;
    }

    res.send({ data: summary });
  } catch (err) {
    res.status(500).send({
      error: "LIVE_SUMMARY_FETCH_FAILED",
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
