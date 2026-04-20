import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActiveRoute, ActiveRouteListItem } from "@/types/bus";
import { buildActiveRouteList, buildRouteDetail } from "@/components/bus/model";
import { buildApiUrl } from "@/lib/api";
import { MAP_SCREEN_CONFIG } from "@/lib/map/mapModels";

async function fetchActiveRoutes(): Promise<ActiveRoute[]> {
  const response = await fetch(buildApiUrl("/bus/live"));
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message ?? "Unable to load bus data.");
  }

  return json.data ?? [];
}

export function useBusRoutes(scheduleVisible: boolean) {
  const [routes, setRoutes] = useState<ActiveRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedStopName, setSelectedStopName] = useState<string | null>(null);
  const [isBusLoading, setIsBusLoading] = useState(true);
  const [isBusRefreshing, setIsBusRefreshing] = useState(false);
  const [busErrorMessage, setBusErrorMessage] = useState<string | null>(null);
  const isBusFetchingRef = useRef(false);

  const routeItems = useMemo<ActiveRouteListItem[]>(
    () => buildActiveRouteList(routes),
    [routes],
  );

  const selectedDetail = useMemo(
    () =>
      selectedRouteId
        ? buildRouteDetail(selectedRouteId, routes, selectedStopName)
        : null,
    [routes, selectedRouteId, selectedStopName],
  );

  const loadRoutes = useCallback(
    async ({
      refreshing = false,
      silent = false,
    }: {
      refreshing?: boolean;
      silent?: boolean;
    } = {}) => {
      if (isBusFetchingRef.current) {
        return;
      }

      isBusFetchingRef.current = true;

      if (refreshing) {
        setIsBusRefreshing(true);
      } else if (!silent) {
        setIsBusLoading(true);
      }

      try {
        const nextRoutes = await fetchActiveRoutes();
        const nextRouteItems = buildActiveRouteList(nextRoutes);

        setRoutes(nextRoutes);
        setBusErrorMessage(null);

        setSelectedRouteId((current) => {
          if (
            current &&
            nextRouteItems.some((item) => item.routeId === current)
          ) {
            return current;
          }

          return nextRouteItems[0]?.routeId ?? null;
        });
      } catch (error) {
        setBusErrorMessage(
          error instanceof Error
            ? error.message
            : "Unexpected error loading bus data.",
        );
      } finally {
        isBusFetchingRef.current = false;

        if (!silent) {
          setIsBusLoading(false);
        }

        if (refreshing) {
          setIsBusRefreshing(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void loadRoutes();
  }, [loadRoutes]);

  useEffect(() => {
    if (!scheduleVisible) {
      return;
    }

    void loadRoutes({ silent: true });

    const intervalId = setInterval(() => {
      void loadRoutes({ silent: true });
    }, MAP_SCREEN_CONFIG.busRefreshIntervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [loadRoutes, scheduleVisible]);

  return {
    routeItems,
    selectedDetail,
    selectedRouteId,
    selectedStopName,
    isBusLoading,
    isBusRefreshing,
    busErrorMessage,
    setSelectedRouteId,
    setSelectedStopName,
    loadRoutes,
  };
}
