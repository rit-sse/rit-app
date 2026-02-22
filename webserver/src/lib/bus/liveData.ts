import {ScrapeCache} from "../../db/cache";
import {getCanonicalStopKey, getStopCoordinate} from "./coordinates";
import {inferSchedule} from "./inference";
import {scrapeRouteDetails, scrapeRouteMetadata} from "./scraper";
import {CommonStop, InferredSchedule, RouteLiveSummary, RouteSchedule} from "../../types/bus";

const BUS_CACHE_KEY = "bus_schedules";

export async function getRoutesFromCacheOrScrape(scrapeCache: ScrapeCache): Promise<RouteSchedule[]> {
    if (await scrapeCache.inCache(BUS_CACHE_KEY) && !(await scrapeCache.isExpired(BUS_CACHE_KEY))) {
        const cached = await scrapeCache.getCache(BUS_CACHE_KEY);
        const cachedRoutes = cached?.data?.data;

        if (Array.isArray(cachedRoutes)) {
            return cachedRoutes as RouteSchedule[];
        }
    }

    const routeMetadata = await scrapeRouteMetadata();
    const routes: RouteSchedule[] = [];

    for (const metadata of routeMetadata) {
        routes.push(await scrapeRouteDetails(metadata));
    }

    await scrapeCache.setCache(BUS_CACHE_KEY, {data: routes});
    return routes;
}

export function getActiveRoutes(routes: RouteSchedule[]): InferredSchedule[] {
    return routes
        .map((route) => inferSchedule(route))
        .filter((route): route is InferredSchedule => route !== null);
}

export function buildRouteSummary(inferred: InferredSchedule): RouteLiveSummary | null {
    const summaryStops = getSummaryStops(inferred);
    if (!summaryStops) {
        return null;
    }

    const {fromStop, toStop} = summaryStops;

    const marker = getStopCoordinate(fromStop.name) ?? getStopCoordinate(toStop.name);
    if (!marker) {
        return null;
    }

    return {
        routeId: inferred.route.rId,
        routeName: inferred.route.routeName,
        fromStop: fromStop.name,
        toStop: toStop.name,
        etaMinutes: toStop.etaMinutes ?? 0,
        status: fromStop.status,
        marker,
        lastUpdated: Date.now(),
    };
}

export function getSummaryStops(inferred: InferredSchedule): { fromStop: InferredSchedule["inferredStops"][number]; toStop: InferredSchedule["inferredStops"][number] } | null {
    if (!inferred.inferredStops.length) {
        return null;
    }

    const fromIndex = Math.min(inferred.currentStopIndex, inferred.inferredStops.length - 1);
    const toIndex = fromIndex + 1 < inferred.inferredStops.length ? fromIndex + 1 : 0;

    return {
        fromStop: inferred.inferredStops[fromIndex],
        toStop: inferred.inferredStops[toIndex],
    };
}

export function buildCommonStopSet(routes: RouteSchedule[]): CommonStop[] {
    const stopsMap = new Map<string, CommonStop>();

    for (const route of routes) {
        for (const stop of route.stops) {
            const key = getCanonicalStopKey(stop.name);
            const existing = stopsMap.get(key);

            if (!existing) {
                const marker = getStopCoordinate(stop.name) ?? undefined;
                stopsMap.set(key, {
                    key,
                    name: stop.name,
                    routeIds: [route.rId],
                    marker,
                });
                continue;
            }

            if (!existing.routeIds.includes(route.rId)) {
                existing.routeIds.push(route.rId);
            }
        }
    }

    return Array.from(stopsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}
