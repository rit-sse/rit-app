export interface ActiveRoute {
  route: {
    rId: string;
    routeName: string;
  };
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
  marker: StopCoordinate;
  lastUpdated: number;
}
