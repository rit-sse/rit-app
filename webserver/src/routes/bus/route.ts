import {Request, Response} from "express";
import {scrapeRouteDetails, scrapeRouteMetadata} from '../../lib/bus/scraper';
import {RouteSchedule} from "../../types/bus";
import {ScrapeCache} from "../../db/cache";

const scrapeCache = new ScrapeCache();

/**
 * GET /bus
 *
 * Returns RIT campus shuttle schedules organized by residence location.
 *
 * Data Flow:
 * 1. Checks database cache (expires after 1 hour)
 * 2. If cached, returns immediately
 * 3. If not cached or expired:
 *    - Scrapes https://www.rit.edu/parking/campus-shuttles
 *    - Normalizes time/date formatting
 *    - Stores in database cache
 *    - Returns normalized data
 *
 * Response Format:
 * {
 *   cachetime: number, (Unix timestamp when data was cached)
 *   data: {
 *     data: NormalizedResidenceSchedule[] (Array of residence schedules)
 *   }
 * }
 *
 * Each residence schedule contains:
 * - name: Residence location (e.g., "Global Village")
 * - routes: Array of shuttle routes serving that location
 *   - rId: Route ID number
 *   - routeName: Name of the shuttle route
 *   - timeRange: Operating hours (normalized format: "7:00 a.m. - 11:46 p.m.")
 *   - days: Days of operation (e.g., "Monday through Friday")
 *
 * @returns 200 with schedule data, or 500 on error
 */
export async function GET(req: Request, res: Response) {
    try {
        // Check cache first
        if (await scrapeCache.inCache("bus_schedules") && !(await scrapeCache.isExpired("bus_schedules"))) {
            res.send(await scrapeCache.getCache("bus_schedule"));
            return;
        }

        // Regular scrape update
        const routeMetadata = await scrapeRouteMetadata();
        const routes: RouteSchedule[] = [];

        for (const metadata of routeMetadata) {
            const route = await scrapeRouteDetails(metadata);
            routes.push(route);
        }

        res.send({
            data: routes
        });
    } catch (err) {
        res.status(500).send({
            error: "Failed to fetch bus schedules",
            message: err instanceof Error ? err.message : String(err)
        });
    }
}