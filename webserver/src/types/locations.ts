export interface Location {
  id: number;
  mdoId: number;
  name: string;
  descShort: string | null;
  abbreviation: string | null;
  buildingNumber: string | null;
  roomNumber: string | null;
  webLink: string | null;
  isSearchable: boolean;
  geometryId: number | null;
}

export type Position = [number, number]; // [latitude, longitude]

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
