export interface Stop {
    name: string;
    times: string[];
}

export interface Route {
    rId: number;
    routeName: string;
    stops: Stop[];
}

export interface InferredStop extends Stop {
    etaMinutes?: number;
    status: "PAST" | "ARRIVING" | "UPCOMING";
}