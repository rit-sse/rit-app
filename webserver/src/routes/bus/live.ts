import {Request, Response} from "express";
import {scrapeRouteDetails, scrapeRouteMetadata} from '@/lib/bus/scraper';
import {InferredSchedule, RouteSchedule} from "@/types/bus";
import {ScrapeCache} from "@/db/cache";
import {inferSchedule} from "@/lib/bus/inference";

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
        // Check cache for schedule data
        let routes: RouteSchedule[];

        if (await scrapeCache.inCache("bus_schedules") && !(await scrapeCache.isExpired("bus_schedules"))) {
            const cached = await scrapeCache.getCache("bus_schedules");
            routes = cached.data.data; // Cache structure is { cachetime, data: { data: routes } }
        } else {
            // Scrape fresh data
            const routeMetadata = await scrapeRouteMetadata();
            routes = [];

            for (const metadata of routeMetadata) {
                const route = await scrapeRouteDetails(metadata);
                routes.push(route);
            }

            // Cache the scraped data
            await scrapeCache.setCache("bus_schedules", {
                data: routes
            });
        }

        // Run inference on all routes and filter out inactive ones
        const activeRoutes: InferredSchedule[] = routes.map(route => inferSchedule(route))
            .filter((inferred): inferred is InferredSchedule => inferred !== null);

        res.send({
            data: activeRoutes
        });
    } catch (err) {
        res.status(500).send({
            error: "Failed to fetch live bus data",
            message: err instanceof Error ? err.message : String(err)
        });
    }
}
