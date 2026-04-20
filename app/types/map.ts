export type Position = [number, number];

export interface Location {
  id: number;
  mdoId: number;
  name: string;
  descShort: string | null;
  descLong: string | null;
  abbreviation: string | null;
  buildingNumber: string | null;
  roomNumber: string | null;
  webLink: string | null;
  isSearchable: boolean;
  geometryId: number | null;
}

export interface LocationSearchRecord {
  mdoId: number;
  name: string;
  abbreviation: string | null;
  buildingNumber: string | null;
  roomNumber: string | null;
  primaryLabel: string;
  secondaryLabel: string | null;
  searchTokens: string[];
}

export type MapPoiCategory =
  | "building"
  | "dining"
  | "culture"
  | "parkingTransit"
  | "service";

export interface MapPoiRecord {
  mdoId: number;
  name: string;
  abbreviation: string | null;
  buildingNumber: string | null;
  category: MapPoiCategory;
  iconName: string;
  minZoom: number;
  priority: number;
  menus: string[];
  labelPoint: Position;
}

export interface MapBootstrapResponse {
  fetchedAt: number;
  expiresAt: number;
  locations: Location[];
  searchRecords: LocationSearchRecord[];
  mapPois: MapPoiRecord[];
}

export interface Bounds {
  southWest: Position;
  northEast: Position;
}

export interface PointGeometry {
  type: "Point";
  coordinates: Position;
}

export interface PolygonGeometry {
  type: "Polygon";
  coordinates: Position[][];
}

export interface MultiPolygonGeometry {
  type: "MultiPolygon";
  coordinates: Position[][][];
}

export type LocationGeometry =
  | PointGeometry
  | PolygonGeometry
  | MultiPolygonGeometry;

export interface LocationFeatureProperties {
  id: number;
  mdoId: number;
  name: string;
  abbreviation: string | null;
  buildingNumber: string | null;
  roomNumber: string | null;
  isSearchable: boolean;
  geometryId: number | null;
  menus: string[];
}

export interface LocationFeature {
  type: "Feature";
  geometry: LocationGeometry;
  properties: LocationFeatureProperties;
}

export interface LocationGeometryResponse {
  mdoId: number;
  features: LocationFeature[];
  labelPoint: Position | null;
  bounds: Bounds | null;
}
