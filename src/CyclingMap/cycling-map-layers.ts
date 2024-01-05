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
    {
        id: "cycling_path_construction",
        type: "line",
        source: mapSource,
        "source-layer": "transitopia_cycling",
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "construction", true],
        ],
        "layout": {
            "line-cap": "butt",
            "line-join": "bevel",
            "visibility": "visible",
        },
        "paint": {
            "line-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false], "rgba(50, 50, 200, 1)",
                ["boolean", ["feature-state", "hover"], false], "rgba(200, 100, 100, 1)",
                "rgba(226, 109, 35, 1)",
            ],
            "line-width": interpolateZoom({ z10: 3, z16: 4 }),
            "line-dasharray": [0.4, 1],
        },
    },
    {
        id: "cycling_path_4",
        type: "line",
        source: mapSource,
        "source-layer": "transitopia_cycling",
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "comfort", 4],
            ["!=", "construction", true],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false], "rgba(50, 50, 200, 1)",
                ["boolean", ["feature-state", "hover"], false], "rgba(200, 100, 100, 1)",
                "rgba(26, 109, 35, 1)",
            ],
            "line-width": interpolateZoom({ z10: 2, z16: 8 }),
        },
    },
    {
        id: "cycling_path_3",
        type: "line",
        source: mapSource,
        "source-layer": "transitopia_cycling",
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "comfort", 3],
            ["!=", "construction", true],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false], "rgba(50, 50, 200, 1)",
                ["boolean", ["feature-state", "hover"], false], "rgba(200, 100, 100, 1)",
                "rgba(26, 109, 35, 1)",
            ],
            "line-width": interpolateZoom({ z10: 2, z16: 7 }),
        },
    },
    {
        // Draw white centre lines overtop of "comfort level 3" cycling paths
        id: "cycling_path_3_inner",
        type: "line",
        source: mapSource,
        "source-layer": "transitopia_cycling",
        "minzoom": 13,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "comfort", 3],
            ["!=", "construction", true],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": "rgba(255, 255, 255, 0.6)",
            "line-width": 2,
            "line-dasharray": [2, 4],
        },
    },
    {
        id: "cycling_path_2",
        type: "line",
        source: mapSource,
        "source-layer": "transitopia_cycling",
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "comfort", 2],
            ["!=", "construction", true],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false], "rgba(50, 50, 200, 1)",
                ["boolean", ["feature-state", "hover"], false], "rgba(200, 100, 100, 1)",
                "rgba(26, 109, 35, 1)",
            ],
            "line-width": interpolateZoom({ z10: 3, z16: 6 }),
            // dashed lines when zoomed in greater than 12
            "line-dasharray": {
                type: "interval",
                stops: [[0, [1]], [12, [0.4, 1.4]]],
            },
        },
    },
    {
        id: "cycling_path_1",
        type: "line",
        source: mapSource,
        "source-layer": "transitopia_cycling",
        minzoom: 8,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "comfort", 1],
            ["!=", "construction", true],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false], "rgba(50, 50, 200, 1)",
                ["boolean", ["feature-state", "hover"], false], "rgba(200, 100, 100, 1)",
                "rgba(26, 50, 35, 1)",
            ],
            "line-width": interpolateZoom({ z10: 2, z16: 4 }),
            "line-dasharray": [0.3, 2],
        },
    },
    {
        id: "cycling_path_name",
        type: "symbol",
        source: mapSource,
        "source-layer": "transportation_name",
        "filter": [
            "all",
            ["!=", "class", "motorway"],
            ["==", "$type", "LineString"],
            ["==", "subclass", "cycleway"],
        ],
        "layout": {
            "symbol-placement": "line",
            "symbol-spacing": 350,
            "text-field": "{name:latin} {name:nonlatin}",
            "text-font": ["Metropolis Regular"],
            "text-max-angle": 30,
            "text-pitch-alignment": "viewport",
            "text-rotation-alignment": "map",
            "text-offset": [0, 1.1],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "text-color": "rgba(24, 79, 19, 1)",
            "text-halo-blur": 1,
            "text-halo-color": "rgba(231, 231, 131, 0.72)",
            "text-halo-width": 2,
        },
    },
];
