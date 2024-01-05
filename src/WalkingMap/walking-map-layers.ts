// Transitopia Cycling map style for MapLibre GL
// By Braden MacDonald
// Code license: MIT (see repository's LICENSE file) 
// Design license: CC-BY 4.0 https://creativecommons.org/licenses/by/4.0/

import type { LayerSpecification } from "maplibre-gl";
import { defaultLineLayout, interpolateZoom } from "../Map/basemap-layers.ts";

// Changes from Positron:
// - Noto Sans font is removed since our font server can only serve one font at a time - https://github.com/openmaptiles/fonts/issues/17

export const mapSource = "omt-transitopia";


export const layers: LayerSpecification[] = [
    // TODO: pedestrian paths under construction
    // TODO: Various comfor levels of pedestrian paths
    {
        // This includes pedestrian paths and cycling paths.
        // We show it on the base map but draw in front of it on the cycling and pedestrian maps
        id: "walking_path",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "class", "path"],
            ["!=", "subclass", "cycleway"],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": "rgb(238, 165, 80)",
            // "line-opacity": 0.9,
            "line-width": interpolateZoom({ z13: 1, z20: 10 }),
        },
    },
    {
        id: "walking_path_name",
        type: "symbol",
        source: mapSource,
        "source-layer": "transportation_name",
        "filter": [
            "all",
            ["!=", "class", "motorway"],
            ["==", "$type", "LineString"],
            ["==", "subclass", "path"],
        ],
        "layout": {
            "symbol-placement": "line",
            "symbol-spacing": 350,
            "text-field": "{name:latin} {name:nonlatin}",
            "text-font": ["Metropolis Regular"],
            "text-max-angle": 30,
            "text-pitch-alignment": "viewport",
            "text-rotation-alignment": "map",
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "text-color": "rgb(50, 50, 50)",
            "text-halo-blur": 1,
            "text-halo-color": "rgba(238, 165, 80, 0.5)",
            "text-translate": [0, -10],
            "text-halo-width": 2,
        },
    },
];
