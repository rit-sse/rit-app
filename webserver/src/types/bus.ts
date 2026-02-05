export interface Stop {
    name: string;
    times: string[];
}

export interface Route {
    rId: string;
    routeName: string;
    timeRange: string;
    days: string;
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