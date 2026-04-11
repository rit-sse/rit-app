import {
  ActiveRoute,
  ActiveRouteListItem,
  InferredStop,
  RouteDetailView,
} from "@/types/bus";

function normalizeStopName(name: string) {
  return name.trim().toLowerCase();
}

function getFocusedStop(route: ActiveRoute): InferredStop | null {
  return (
    route.inferredStops.find((stop) => stop.status === "ARRIVING") ??
    route.inferredStops.find((stop) => stop.status === "UPCOMING") ??
    route.inferredStops[route.currentStopIndex] ??
    route.inferredStops[0] ??
    null
  );
}

export function buildActiveRouteList(
  routes: ActiveRoute[],
): ActiveRouteListItem[] {
  return routes
    .map((route) => {
      const focusedStop = getFocusedStop(route);
      const focusedIndex = focusedStop
        ? route.inferredStops.findIndex(
            (stop) => stop.name === focusedStop.name,
          )
        : -1;
      const nextStop =
        focusedIndex >= 0
          ? (route.inferredStops
              .slice(focusedIndex + 1)
              .find((stop) => stop.status !== "PAST") ?? null)
          : null;

      return {
        routeId: route.route.rId,
        routeName: route.route.routeName,
        currentStopName: focusedStop?.name ?? null,
        nextStopName: nextStop?.name ?? null,
        etaMinutes: focusedStop?.etaMinutes ?? null,
        status: focusedStop?.status ?? null,
      };
    })
    .sort(
      (a, b) =>
        (a.etaMinutes ?? Number.MAX_SAFE_INTEGER) -
        (b.etaMinutes ?? Number.MAX_SAFE_INTEGER),
    );
}

export function buildRouteDetail(
  routeId: string,
  routes: ActiveRoute[],
  selectedStopName?: string | null,
): RouteDetailView | null {
  const route = routes.find((candidate) => candidate.route.rId === routeId);
  if (!route) {
    return null;
  }

  const normalizedTarget = selectedStopName
    ? normalizeStopName(selectedStopName)
    : null;
  const selectedStop =
    (normalizedTarget
      ? route.inferredStops.find(
          (stop) => normalizeStopName(stop.name) === normalizedTarget,
        )
      : null) ?? getFocusedStop(route);

  if (!selectedStop) {
    return null;
  }

  const selectedIndex = route.inferredStops.findIndex(
    (stop) =>
      normalizeStopName(stop.name) === normalizeStopName(selectedStop.name),
  );

  const nextStop =
    route.inferredStops
      .slice(selectedIndex + 1)
      .find((stop) => stop.status !== "PAST") ?? null;

  return {
    stopName: selectedStop.name,
    routeId: route.route.rId,
    routeName: route.route.routeName,
    etaMinutes: selectedStop.etaMinutes ?? 0,
    nextStopName: nextStop?.name ?? null,
    stops: route.inferredStops,
  };
}
