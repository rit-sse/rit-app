export function buildUnifiedPoiLayerStyle(): any {
  return {
    iconImage: [
      "match",
      ["get", "category"],
      "building",
      "college-15",
      "parkingTransit",
      "parking-15",
      "service",
      "information-15",
      "dining",
      "restaurant-15",
      "culture",
      "monument-15",
      "marker-15",
    ],
    iconSize: 1,
    iconAnchor: "right",
    textField: ["get", "name"],
    textSize: ["match", ["get", "category"], "building", 15, "culture", 13, 12],
    textColor: [
      "match",
      ["get", "category"],
      "building",
      "#111827",
      "culture",
      "#1f2937",
      "dining",
      "#7c2d12",
      "service",
      "#1d4ed8",
      "parkingTransit",
      "#4b5563",
      "#111827",
    ],
    textHaloColor: "#ffffff",
    textHaloWidth: 1.8,
    textFont: ["Open Sans Semibold"],
    textAnchor: "left",
    textAllowOverlap: false,
    textOffset: [0.5, 0],
    textPadding: 4,
    textMaxWidth: 12,
    symbolSortKey: ["get", "placementSortKey"],
  };
}

export function buildPoiMinZoomBucketFilter(
  minZoomInclusive: number,
  maxZoomExclusive?: number,
) {
  if (typeof maxZoomExclusive === "number") {
    return [
      "all",
      [">=", ["get", "minZoom"], minZoomInclusive],
      ["<", ["get", "minZoom"], maxZoomExclusive],
    ] as const;
  }

  return [">=", ["get", "minZoom"], minZoomInclusive] as const;
}
