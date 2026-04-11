export interface StopSchedule {
  name: string;
  times: string[];
}

export interface RouteSchedule {
  rId: string;
  routeName: string;
  timeRange: string;
  days: string;
  stops: StopSchedule[];
}

export interface InferredStop {
  name: string;
  etaMinutes?: number;
  status: "PAST" | "ARRIVING" | "UPCOMING";
  times?: string[];
}

export interface ActiveRoute {
  route: RouteSchedule;
  currentStopIndex: number;
  inferredStops: InferredStop[];
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

export interface LiveRoutesResponse {
  data: ActiveRoute[];
}

export interface ActiveStopArrival {
  routeId: string;
  routeName: string;
  etaMinutes: number;
  status: "ARRIVING" | "UPCOMING";
}

export interface ActiveStopListItem {
  stopName: string;
  soonestEta: number;
  arrivals: ActiveStopArrival[];
}

export interface ActiveRouteListItem {
  routeId: string;
  routeName: string;
  currentStopName: string | null;
  nextStopName: string | null;
  etaMinutes: number | null;
  status: "PAST" | "ARRIVING" | "UPCOMING" | null;
}

export interface RouteDetailView {
  stopName: string;
  routeId: string;
  routeName: string;
  etaMinutes: number;
  nextStopName: string | null;
  stops: InferredStop[];
}
