export interface RawLocation {
  id: number;
  mdo_id: number;
  name: string;
  descShort: string | null;
  descLong: string | null;
  phone: string | null;
  webLink: string | null;
  abbreviation: string | null;
  buildingNumber: string | null;
  thumbnail: string | null;
  floorLevel: string | null;
  roomNumber: string | null;
  hours: string | null;
  address: string | null;
  isSearchable: boolean;
  geometry_id: number | null;
}

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

export interface MapBootstrapResponse {
  fetchedAt: number;
  expiresAt: number;
  locations: LocationSearchRecord[];
}

export type Position = [number, number]; // [long, lat]

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

export interface RawLocationImage {
  alt: string;
  url: string;
  mdo_id: number;
  location_id: number;
}

export interface RawLocationFeatureProperties {
  id: number;
  mdo_id: number;
  name: string;
  descShort?: string | null;
  descLong?: string | null;
  phone?: string | null;
  webLink?: string | null;
  abbreviation?: string | null;
  buildingNumber?: string | null;
  roomNumber?: string | null;
  hours?: string | null;
  isSearchable: boolean;
  geometry_id: number | null;
  images?: RawLocationImage[];
  menus?: string[];
}

export interface RawLocationFeature {
  type: "Feature";
  geometry: LocationGeometry;
  properties: RawLocationFeatureProperties;
}

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

export interface EnrichedLocation {
  location: Location;
  search: LocationSearchRecord;
  features: LocationFeature[];
  labelPoint: Position | null;
}
