export const RIT_CAMPUS_STYLE_JSON = JSON.stringify({
  version: 8,
  name: "RIT Campus Vector Light",
  metadata: {
    "app:theme": "rit-campus-light",
  },
  sources: {
    composite: {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8",
    },
  },
  sprite: "mapbox://sprites/mapbox/streets-v11",
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#f4f1ee",
      },
    },
    {
      id: "landuse-grass",
      type: "fill",
      source: "composite",
      "source-layer": "landuse",
      filter: ["in", "class", "park", "pitch", "garden", "grass"],
      paint: {
        "fill-color": "#dce8d5",
      },
    },
    {
      id: "landuse-school",
      type: "fill",
      source: "composite",
      "source-layer": "landuse",
      filter: ["==", "class", "school"],
      paint: {
        "fill-color": "#f8ece5", // Subtle RIT orange tint for the campus ground
        "fill-opacity": 0.8,
      },
    },
    {
      id: "water",
      type: "fill",
      source: "composite",
      "source-layer": "water",
      paint: {
        "fill-color": "#c4d7ed",
      },
    },
    {
      id: "pedestrian-path",
      type: "line",
      source: "composite",
      "source-layer": "road",
      filter: ["in", "class", "pedestrian", "path", "track"],
      paint: {
        "line-color": "#F36E21", // RIT Orange for campus paths!
        "line-width": ["interpolate", ["linear"], ["zoom"], 14, 1, 18, 3],
        "line-opacity": 0.8,
        "line-dasharray": [1, 1.5],
      },
    },
    {
      id: "road-street-case",
      type: "line",
      source: "composite",
      "source-layer": "road",
      filter: [
        "in",
        "class",
        "street",
        "street_limited",
        "secondary",
        "primary",
        "motorway",
        "trunk",
        "tertiary",
        "link",
      ],
      paint: {
        "line-color": "#d0cfcf",
        "line-width": ["interpolate", ["linear"], ["zoom"], 12, 1.5, 18, 16],
      },
    },
    {
      id: "road-street",
      type: "line",
      source: "composite",
      "source-layer": "road",
      filter: [
        "in",
        "class",
        "street",
        "street_limited",
        "secondary",
        "primary",
        "motorway",
        "trunk",
        "tertiary",
        "link",
      ],
      paint: {
        "line-color": "#ffffff",
        "line-width": ["interpolate", ["linear"], ["zoom"], 12, 1, 18, 14],
      },
    },
    {
      id: "building",
      type: "fill-extrusion",
      source: "composite",
      "source-layer": "building",
      paint: {
        "fill-extrusion-color": "#ffffff",
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": ["get", "min_height"],
        "fill-extrusion-opacity": 0.85,
      },
    },

    {
      id: "road-labels",
      type: "symbol",
      source: "composite",
      "source-layer": "road_label",
      layout: {
        "text-field": ["get", "name_en"],
        "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 14, 10, 18, 13],
        "symbol-placement": "line",
      },
      paint: {
        "text-color": "#666666",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.5,
      },
    },
  ],
});
