import { ScrapeCache } from "../../db/cache";
import { inferSchedule } from "./inference";
import {
  enrichRouteServiceFields,
  scrapeRouteDetails,
  scrapeRouteMetadata,
} from "./scraper";
import {
  InferredSchedule,
  RouteLiveSummary,
  RouteSchedule,
} from "../../../types/bus";

const BUS_CACHE_KEY = "bus_schedules";

function sortRoutesById<T extends { rId: string }>(routes: T[]): T[] {
  return [...routes].sort((a, b) => Number(a.rId) - Number(b.rId));
}

function normalizeRoutes(routes: RouteSchedule[]): RouteSchedule[] {
  return sortRoutesById(routes.map((route) => enrichRouteServiceFields(route)));
}

export async function getRoutesFromCacheOrScrape(
  scrapeCache: ScrapeCache,
): Promise<RouteSchedule[]> {
  if (
    (await scrapeCache.inCache(BUS_CACHE_KEY)) &&
    !(await scrapeCache.isExpired(BUS_CACHE_KEY))
  ) {
    const cached = await scrapeCache.getCache(BUS_CACHE_KEY);
    const cachedRoutes = cached?.data?.data;

    if (Array.isArray(cachedRoutes)) {
      return normalizeRoutes(cachedRoutes as RouteSchedule[]);
    }
  }

  const routeMetadata = await scrapeRouteMetadata();
  const routes: RouteSchedule[] = [];

  for (const metadata of routeMetadata) {
    routes.push(await scrapeRouteDetails(metadata));
  }

  const normalizedRoutes = normalizeRoutes(routes);
  await scrapeCache.setCache(BUS_CACHE_KEY, { data: normalizedRoutes });
  return normalizedRoutes;
}

export function getActiveRoutes(routes: RouteSchedule[]): InferredSchedule[] {
  return normalizeRoutes(routes)
    .map((route) => inferSchedule(route))
    .filter((route): route is InferredSchedule => route !== null);
}

export function buildRouteSummary(
  inferred: InferredSchedule,
): RouteLiveSummary | null {
  const summaryStops = getSummaryStops(inferred);
  if (!summaryStops) {
    return null;
  }

  const { fromStop, toStop } = summaryStops;

  return {
    routeId: inferred.route.rId,
    routeName: inferred.route.routeName,
    fromStop: fromStop.name,
    toStop: toStop.name,
    etaMinutes: toStop.etaMinutes ?? 0,
    status: fromStop.status,
    lastUpdated: Date.now(),
  };
}

export function getSummaryStops(
  inferred: InferredSchedule,
): {
  fromStop: InferredSchedule["inferredStops"][number];
  toStop: InferredSchedule["inferredStops"][number];
} | null {
  if (!inferred.inferredStops.length) {
    return null;
  }

  const fromIndex = Math.min(
    inferred.currentStopIndex,
    inferred.inferredStops.length - 1,
  );
  const toIndex =
    fromIndex + 1 < inferred.inferredStops.length ? fromIndex + 1 : 0;

  return {
    fromStop: inferred.inferredStops[fromIndex],
    toStop: inferred.inferredStops[toIndex],
  };
}
