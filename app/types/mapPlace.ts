// Minimal shape shared by anything selectable on the map (a building-drawer
// row or a search result) - both NamedBuilding and CampusLocation normalize
// into this for BuildingCard and the pin/route flow.
export interface MapPlace {
  name: string;
  latitude: number | null;
  longitude: number | null;
  code?: string;
  category?: string;
}
