export interface Stop {
    name: string;
    times: string[];
}

export type ServiceDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ServiceWindow {
    startMinutes: number;
    endMinutes: number;
    crossesMidnight: boolean;
}

export interface Route {
    rId: string;
    routeName: string;
    timeRange: string;
    days: string;
    serviceDays: ServiceDay[];
    serviceWindow: ServiceWindow | null;
}

export interface ResidenceSchedule {
    name: string;
    routes: Route[];
}

export interface InferredStop extends Stop {
    etaMinutes?: number;
    status: "PAST" | "ARRIVING" | "UPCOMING";
}

/**
 * Normalized version of a Route with standardized formatting
 */
export interface NormalizedRoute extends Route {
    timeRange: string;
    days: string;
}

/**
 * Normalized version of ResidenceSchedule with standardized route formatting
 */
export interface NormalizedResidenceSchedule extends ResidenceSchedule {
    routes: NormalizedRoute[];
}

export interface RouteSchedule extends NormalizedRoute {
    stops: Stop[]; // Array of stops with times
}

export interface InferredSchedule {
    route: RouteSchedule;
    currentStopIndex: number;
    inferredStops: InferredStop[]; // Stops w/ ETA & Status
}

export interface StopCoordinate {
    lat: number;
    lon: number;
    source: "STOP_APPROX";
}

export interface RouteLiveSummary {
    routeId: string;
    routeName: string;
    fromStop: string;
    toStop: string;
    etaMinutes: number;
    status: "PAST" | "ARRIVING" | "UPCOMING";
    lastUpdated: number;
}
