import {Request, Response} from "express";
import {ScrapeCache} from "../../db/cache";
import {buildCommonStopSet, getActiveRoutes, getRoutesFromCacheOrScrape} from "../../lib/bus/liveData";

const scrapeCache = new ScrapeCache();

/**
 * GET /bus/live
 *
 * Returns real-time bus predictions with ETAs and statuses.
 * Only returns routes that have active buses running right now.
 *
 * Response Format:
 * {
 *   data: InferredSchedule[] (Array of active routes with predictions)
 * }
 *
 * Each InferredSchedule contains:
 * - route: The full route schedule
 * - currentStopIndex: Which stop the bus is currently at/approaching
 * - inferredStops: Array of stops with:
 *   - name: Stop name
 *   - times: All scheduled times
 *   - etaMinutes: Minutes until bus arrives (only for upcoming stops)
 *   - status: "PAST" | "ARRIVING" | "UPCOMING"
 *
 * @returns 200 with active bus predictions, or 500 on error
 */
export async function GET(req: Request, res: Response) {
    try {
        const routes = await getRoutesFromCacheOrScrape(scrapeCache);
        const activeRoutes = getActiveRoutes(routes);
        const activeRouteSchedules = activeRoutes.map((route) => route.route);
        const commonStops = buildCommonStopSet(activeRouteSchedules);

        res.send({
            data: activeRoutes,
            commonStops,
        });
    } catch (err) {
        res.status(500).send({
            error: "Failed to fetch live bus data",
            message: err instanceof Error ? err.message : String(err)
        });
    }
}
