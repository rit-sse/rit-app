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