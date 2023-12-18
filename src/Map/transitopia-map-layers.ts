// Transitopia map style for MapLibre GL
// Derived from https://github.com/openmaptiles/positron-gl-style
// Which is Copyright (c) 2016, KlokanTech.com & OpenMapTiles contributors. (c) 2015, CartoDB Inc.
// Derived from "CartoDB Basemaps" (https://github.com/CartoDB/CartoDB-basemaps) designed by Stamen and Paul Norman for CartoDB Inc., licensed under CC-BY 3.0.
// Code license: BSD 3-Clause License
// Design license: CC-BY 4.0
// Details: https://github.com/openmaptiles/positron-gl-style/blob/master/LICENSE.md

// Changes from Positron:
// - Noto Sans font is removed since our font server can only serve one font at a time - https://github.com/openmaptiles/fonts/issues/17

import type {
    ColorSpecification,
    DataDrivenPropertyValueSpecification,
    ExpressionSpecification,
    LayerSpecification,
} from "maplibre-gl";

export const mapSource = "omt-transitopia";

/** A linear interpolation of values based on the zoom level */
function interpolateZoom<T>(
    stops: {
        [zoom: `z${number}`]:
        | T
        | T[]
        | ColorSpecification
        | ExpressionSpecification;
    },
): DataDrivenPropertyValueSpecification<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spec: any[] = [];
    Object.entries(stops).forEach(([zoomValue, expr]) => {
        spec.push(Number(zoomValue.substring(1))); // Remove the 'z' prefix from the zoom value
        spec.push(expr);
    });
    return ["interpolate", ["linear"], ["zoom"], ...spec];
}

/**
 * An exponential interpolation of the value, based on zoom values
 * Higher values of the exponential 'base' make the output increase
 * more towards the high end of the range.
 * A base of '1' is equivalent to a linear interpolation.
 */
function interpolateZoomExp<T>(
    { base, ...stops }: {
        base: number;
        [zoom: `z${number}`]:
        | T
        | T[]
        | ColorSpecification
        | ExpressionSpecification;
    },
): DataDrivenPropertyValueSpecification<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spec: any[] = [];
    Object.entries(stops).forEach(([zoomValue, expr]) => {
        spec.push(Number(zoomValue.substring(1))); // Remove the 'z' prefix from the zoom value
        spec.push(expr);
    });
    return ["interpolate", ["exponential", base], ["zoom"], ...spec];
}

const defaultLineLayout = {
    "line-cap": "round",
    "line-join": "round",
    "visibility": "visible",
} as const;

export const layers: LayerSpecification[] = [
    {
        id: "background",
        type: "background",
        paint: { "background-color": "rgba(250, 250, 250, 1)" },
    },
    {
        id: "landcover_wood",
        type: "fill",
        source: mapSource,
        "source-layer": "landcover",
        "minzoom": 10,
        "filter": ["all", ["==", "$type", "Polygon"], ["==", "class", "wood"]],
        "layout": { "visibility": "visible" },
        "paint": {
            "fill-color": "rgba(246, 248, 246, 1)",
            "fill-opacity": interpolateZoom({ z10: 0, z12: 1 }),
        },
    },
    {
        id: "park",
        type: "fill",
        source: mapSource,
        "source-layer": "park",
        "filter": ["==", "$type", "Polygon"],
        "layout": { "visibility": "visible" },
        "paint": { "fill-color": "rgba(214, 219, 214, 1)" },
    },
    {
        id: "water",
        type: "fill",
        source: mapSource,
        "source-layer": "water",
        "filter": [
            "all",
            ["==", "$type", "Polygon"],
            ["!=", "brunnel", "tunnel"],
        ],
        "layout": { "visibility": "visible" },
        "paint": { "fill-antialias": true, "fill-color": "rgba(203, 217, 243, 1)" },
    },
    {
        id: "waterway",
        type: "line",
        source: mapSource,
        "source-layer": "waterway",
        "filter": ["==", "$type", "LineString"],
        "layout": { "visibility": "visible" },
        "paint": { "line-color": "hsl(195, 17%, 78%)" },
    },
    {
        id: "water_name",
        type: "symbol",
        source: mapSource,
        "source-layer": "water_name",
        "filter": ["==", "$type", "LineString"],
        "layout": {
            "symbol-placement": "line",
            "symbol-spacing": 500,
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Metropolis Medium Italic"],
            "text-rotation-alignment": "map",
            "text-size": 12,
        },
        "paint": {
            "text-color": "rgb(157,169,177)",
            "text-halo-blur": 1,
            "text-halo-color": "rgb(242,243,240)",
            "text-halo-width": 1,
        },
    },
    // We don't show buildings on the map
    // {
    //     id: "building",
    //     type: "fill",
    //     source: mapSource,
    //     "source-layer": "building",
    //     "minzoom": 12,
    //     "layout": { "visibility": "none" },
    //     "paint": {
    //         "fill-antialias": true,
    //         "fill-color": "rgb(234, 234, 229)",
    //         "fill-outline-color": "rgb(219, 219, 218)",
    //     },
    // },
    {
        id: "tunnel_motorway_casing",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 6,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["all", ["==", "brunnel", "tunnel"], ["==", "class", "motorway"]],
        ],
        "layout": {
            "line-cap": "butt",
            "line-join": "miter",
            "visibility": "visible",
        },
        "paint": {
            "line-color": "rgb(213, 213, 213)",
            "line-opacity": 1,
            "line-width": interpolateZoomExp({
                base: 1.4,
                "z5.8": 0,
                z6: 3,
                z20: 40,
            }),
        },
    },
    {
        id: "tunnel_motorway_inner",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 6,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["all", ["==", "brunnel", "tunnel"], ["==", "class", "motorway"]],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": "rgb(234,234,234)",
            "line-width": interpolateZoomExp({ base: 1.4, z4: 2, z6: 1.3, z20: 30 }),
        },
    },
    {
        id: "aeroway-taxiway",
        type: "line",
        source: mapSource,
        "source-layer": "aeroway",
        "minzoom": 12,
        "filter": ["all", ["in", "class", "taxiway"]],
        layout: defaultLineLayout,
        "paint": {
            "line-color": "hsl(0, 0%, 88%)",
            "line-opacity": 1,
            "line-width": interpolateZoomExp({ base: 1.55, z13: 1.8, z20: 20 }),
        },
    },
    {
        id: "aeroway-runway-casing",
        type: "line",
        source: mapSource,
        "source-layer": "aeroway",
        "minzoom": 11,
        "filter": ["all", ["in", "class", "runway"]],
        layout: defaultLineLayout,
        "paint": {
            "line-color": "hsl(0, 0%, 88%)",
            "line-opacity": 1,
            "line-width": interpolateZoomExp({ base: 1.5, z11: 6, z17: 55 }),
        },
    },
    {
        id: "aeroway-area",
        type: "fill",
        source: mapSource,
        "source-layer": "aeroway",
        "minzoom": 4,
        "filter": [
            "all",
            ["==", "$type", "Polygon"],
            ["in", "class", "runway", "taxiway"],
        ],
        "layout": { "visibility": "visible" },
        "paint": {
            "fill-color": "rgba(255, 255, 255, 1)",
            "fill-opacity": interpolateZoom({ z13: 0, z14: 1 }),
        },
    },
    {
        id: "aeroway-runway",
        type: "line",
        source: mapSource,
        "source-layer": "aeroway",
        "minzoom": 11,
        "filter": [
            "all",
            ["in", "class", "runway"],
            ["==", "$type", "LineString"],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": "rgba(255, 255, 255, 1)",
            "line-opacity": 1,
            "line-width": interpolateZoomExp({ base: 1.5, z11: 4, z17: 50 }),
        },
    },
    {
        id: "road_area_pier",
        type: "fill",
        "metadata": {},
        source: mapSource,
        "source-layer": "transportation",
        "filter": ["all", ["==", "$type", "Polygon"], ["==", "class", "pier"]],
        "layout": { "visibility": "visible" },
        "paint": { "fill-antialias": true, "fill-color": "rgb(242,243,240)" },
    },
    {
        id: "road_pier",
        type: "line",
        "metadata": {},
        source: mapSource,
        "source-layer": "transportation",
        "filter": ["all", ["==", "$type", "LineString"], ["in", "class", "pier"]],
        "layout": { "line-cap": "round", "line-join": "round" },
        "paint": {
            "line-color": "rgb(242,243,240)",
            "line-width": interpolateZoomExp({ base: 1.2, z15: 1, z17: 4 }),
        },
    },
    {
        id: "highway_minor",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 8,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["in", "class", "minor", "service", "track"],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": "hsl(0, 0%, 88%)",
            "line-opacity": 0.9,
            "line-width": interpolateZoomExp({ base: 1.55, z13: 1.8, z20: 20 }),
        },
    },
    {
        id: "highway_major_casing",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 11,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["in", "class", "primary", "secondary", "tertiary", "trunk"],
        ],
        "layout": {
            "line-cap": "butt",
            "line-join": "miter",
            "visibility": "visible",
        },
        "paint": {
            "line-color": "rgb(213, 213, 213)",
            "line-dasharray": [12, 0],
            "line-width": interpolateZoomExp({ base: 1.3, z10: 3, z20: 23 }),
        },
    },
    {
        id: "highway_major_inner",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 11,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["in", "class", "primary", "secondary", "tertiary", "trunk"],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": "#fff",
            "line-width": interpolateZoomExp({ base: 1.3, z10: 2, z20: 20 }),
        },
    },
    {
        id: "highway_major_subtle",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "maxzoom": 11,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["in", "class", "primary", "secondary", "tertiary", "trunk"],
        ],
        layout: defaultLineLayout,
        "paint": { "line-color": "hsla(0, 0%, 85%, 0.69)", "line-width": 2 },
    },
    {
        id: "highway_motorway_casing",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 6,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            [
                "all",
                ["!in", "brunnel", "bridge", "tunnel"],
                ["==", "class", "motorway"],
            ],
        ],
        "layout": {
            "line-cap": "butt",
            "line-join": "miter",
            "visibility": "visible",
        },
        "paint": {
            "line-color": "rgb(213, 213, 213)",
            "line-dasharray": [2, 0],
            "line-opacity": 1,
            "line-width": interpolateZoomExp({
                base: 1.4,
                "z5.8": 0,
                z6: 3,
                z20: 40,
            }),
        },
    },
    {
        id: "highway_motorway_inner",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 6,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            [
                "all",
                ["!in", "brunnel", "bridge", "tunnel"],
                ["==", "class", "motorway"],
            ],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": interpolateZoom({
                "z5.8": "hsla(0, 0%, 85%, 0.53)",
                z6: "#fff",
            }),
            "line-width": interpolateZoomExp({ base: 1.4, z4: 2, z6: 1.3, z20: 30 }),
        },
    },
    {
        id: "highway_motorway_subtle",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "maxzoom": 6,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "class", "motorway"],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": "hsla(0, 0%, 85%, 0.53)",
            "line-width": interpolateZoomExp({ base: 1.4, z4: 2, z6: 1.3 }),
        },
    },
    {
        id: "railway_transit",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 16,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["all", ["==", "class", "transit"], ["!in", "brunnel", "tunnel"]],
        ],
        "layout": { "line-join": "round", "visibility": "visible" },
        "paint": { "line-color": "#dddddd", "line-width": 3 },
    },
    {
        id: "railway_transit_dashline",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 16,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["all", ["==", "class", "transit"], ["!in", "brunnel", "tunnel"]],
        ],
        "layout": { "line-join": "round", "visibility": "visible" },
        "paint": {
            "line-color": "#fafafa",
            "line-dasharray": [3, 3],
            "line-width": 2,
        },
    },
    {
        id: "railway_service",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 16,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["all", ["==", "class", "rail"], ["has", "service"]],
        ],
        "layout": { "line-join": "round", "visibility": "visible" },
        "paint": { "line-color": "#dddddd", "line-width": 3 },
    },
    {
        id: "railway_service_dashline",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 16,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "class", "rail"],
            ["has", "service"],
        ],
        "layout": { "line-join": "round", "visibility": "visible" },
        "paint": {
            "line-color": "#fafafa",
            "line-dasharray": [3, 3],
            "line-width": 2,
        },
    },
    {
        id: "railway",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 13,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["all", ["!has", "service"], ["==", "class", "rail"]],
        ],
        "layout": { "line-join": "round", "visibility": "visible" },
        "paint": {
            "line-color": "#dddddd",
            "line-width": interpolateZoomExp({ base: 1.3, z16: 3, z20: 7 }),
        },
    },
    {
        id: "railway_dashline",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 13,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["all", ["!has", "service"], ["==", "class", "rail"]],
        ],
        "layout": { "line-join": "round", "visibility": "visible" },
        "paint": {
            "line-color": "#fafafa",
            "line-dasharray": [3, 3],
            "line-width": interpolateZoomExp({ base: 1.3, z16: 2, z20: 6 }),
        },
    },
    {
        id: "highway_motorway_bridge_casing",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 6,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["all", ["==", "brunnel", "bridge"], ["==", "class", "motorway"]],
        ],
        "layout": {
            "line-cap": "butt",
            "line-join": "miter",
            "visibility": "visible",
        },
        "paint": {
            "line-color": "rgb(213, 213, 213)",
            "line-dasharray": [2, 0],
            "line-opacity": 1,
            "line-width": interpolateZoomExp({
                base: 1.4,
                "z5.8": 0,
                z6: 5,
                z20: 45,
            }),
        },
    },
    {
        id: "highway_motorway_bridge_inner",
        type: "line",
        source: mapSource,
        "source-layer": "transportation",
        "minzoom": 6,
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["all", ["==", "brunnel", "bridge"], ["==", "class", "motorway"]],
        ],
        layout: defaultLineLayout,
        "paint": {
            "line-color": interpolateZoom({
                "z5.8": "hsla(0, 0%, 85%, 0.53)",
                z6: "#fff",
            }),
            "line-width": interpolateZoomExp({ base: 1.4, z4: 2, z6: 1.3, z20: 30 }),
        },
    },
    {
        id: "highway_name_other",
        type: "symbol",
        source: mapSource,
        "source-layer": "transportation_name",
        "filter": [
            "all",
            ["!=", "class", "motorway"],
            ["==", "$type", "LineString"],
            ["!=", "subclass", "cycleway"],
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
            "text-color": "rgba(116, 108, 108, 1)",
            "text-halo-blur": 1,
            "text-halo-color": "rgba(255, 255, 255, 0.46)",
            "text-translate": [0, -10],
            "text-halo-width": 1,
        },
    },
    {
        id: "highway_name_motorway",
        type: "symbol",
        source: mapSource,
        "source-layer": "transportation_name",
        "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "class", "motorway"],
        ],
        "layout": {
            "symbol-placement": "line",
            "symbol-spacing": 350,
            "text-field": "{ref}",
            "text-font": ["Metropolis Light"],
            "text-pitch-alignment": "viewport",
            "text-rotation-alignment": "viewport",
            "text-size": 10,
            "visibility": "visible",
        },
        "paint": {
            "text-color": "rgb(117, 129, 145)",
            "text-halo-blur": 1,
            "text-halo-color": "hsl(0, 0%, 100%)",
            "text-halo-width": 1,
            "text-translate": [0, 2],
        },
    },
    {
        id: "boundary_state",
        type: "line",
        source: mapSource,
        "source-layer": "boundary",
        "filter": ["==", "admin_level", 4],
        layout: defaultLineLayout,
        "paint": {
            "line-blur": 0.4,
            "line-color": "rgb(230, 204, 207)",
            "line-dasharray": [2, 2],
            "line-opacity": 1,
            "line-width": interpolateZoomExp({ z3: 1, z22: 15, base: 1.3 }),
        },
    },
    {
        id: "boundary_country_z0-4",
        type: "line",
        source: mapSource,
        "source-layer": "boundary",
        "maxzoom": 5,
        "filter": ["all", ["==", "admin_level", 2], ["!has", "claimed_by"]],
        "layout": { "line-cap": "round", "line-join": "round" },
        "paint": {
            "line-blur": interpolateZoom({ z0: 0.4, z22: 4 }),
            "line-color": "rgb(230, 204, 207)",
            "line-opacity": 1,
            "line-width": interpolateZoomExp({ base: 1.1, z3: 1, z22: 20 }),
        },
    },
    {
        id: "boundary_country_z5-",
        type: "line",
        source: mapSource,
        "source-layer": "boundary",
        "minzoom": 5,
        "filter": ["==", "admin_level", 2],
        "layout": { "line-cap": "round", "line-join": "round" },
        "paint": {
            "line-blur": interpolateZoom({ z0: 0.4, z22: 4 }),
            "line-color": "rgb(230, 204, 207)",
            "line-opacity": 1,
            "line-width": interpolateZoomExp({ base: 1.1, z3: 1, z22: 20 }),
        },
    },
    {
        id: "place_other",
        type: "symbol",
        source: mapSource,
        "source-layer": "place",
        "maxzoom": 14,
        "filter": [
            "all",
            [
                "in",
                "class",
                "continent",
                "hamlet",
                "neighbourhood",
                "isolated_dwelling",
            ],
            ["==", "$type", "Point"],
        ],
        "layout": {
            "text-anchor": "center",
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Metropolis Regular"],
            "text-justify": "center",
            "text-offset": [0.5, 0],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "text-color": "rgb(117, 129, 145)",
            "text-halo-blur": 1,
            "text-halo-color": "rgb(242,243,240)",
            "text-halo-width": 1,
        },
    },
    {
        id: "place_suburb",
        type: "symbol",
        source: mapSource,
        "source-layer": "place",
        "maxzoom": 15,
        "filter": ["all", ["==", "$type", "Point"], ["==", "class", "suburb"]],
        "layout": {
            "text-anchor": "center",
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Metropolis Regular"],
            "text-justify": "center",
            "text-offset": [0.5, 0],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "text-color": "rgb(117, 129, 145)",
            "text-halo-blur": 1,
            "text-halo-color": "rgb(242,243,240)",
            "text-halo-width": 1,
        },
    },
    {
        id: "place_village",
        type: "symbol",
        source: mapSource,
        "source-layer": "place",
        "maxzoom": 14,
        "filter": ["all", ["==", "$type", "Point"], ["==", "class", "village"]],
        "layout": {
            "icon-size": 0.4,
            "text-anchor": "left",
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Metropolis Regular"],
            "text-justify": "left",
            "text-offset": [0.5, 0.2],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "icon-opacity": 0.7,
            "text-color": "rgb(117, 129, 145)",
            "text-halo-blur": 1,
            "text-halo-color": "rgb(242,243,240)",
            "text-halo-width": 1,
        },
    },
    {
        id: "place_town",
        type: "symbol",
        source: mapSource,
        "source-layer": "place",
        "maxzoom": 15,
        "filter": ["all", ["==", "$type", "Point"], ["==", "class", "town"]],
        "layout": {
            "icon-image": { type: "interval", stops: [[0, "circle-11"], [8, ""]] },
            "icon-size": 0.4,
            "text-anchor": { type: "interval", stops: [[0, "left"], [8, "center"]] },
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Metropolis Regular"],
            "text-justify": "left",
            "text-offset": [0.5, 0.2],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "icon-opacity": 0.7,
            "text-color": "rgb(117, 129, 145)",
            "text-halo-blur": 1,
            "text-halo-color": "rgb(242,243,240)",
            "text-halo-width": 1,
        },
    },
    {
        id: "place_city",
        type: "symbol",
        source: mapSource,
        "source-layer": "place",
        "maxzoom": 14,
        "filter": [
            "all",
            ["==", "$type", "Point"],
            ["all", ["!=", "capital", 2], ["==", "class", "city"], [">", "rank", 3]],
        ],
        "layout": {
            "icon-image": { type: "interval", stops: [[0, "circle-11"], [8, ""]] },
            "icon-size": 0.4,
            "text-anchor": { type: "interval", stops: [[0, "left"], [8, "center"]] },
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Metropolis Regular"],
            "text-justify": "left",
            "text-offset": [0.5, 0.2],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "icon-opacity": 0.7,
            "text-color": "rgb(117, 129, 145)",
            "text-halo-blur": 1,
            "text-halo-color": "rgb(242,243,240)",
            "text-halo-width": 1,
        },
    },
    {
        id: "place_capital",
        type: "symbol",
        source: mapSource,
        "source-layer": "place",
        "maxzoom": 12,
        "filter": [
            "all",
            ["==", "$type", "Point"],
            ["all", ["==", "capital", 2], ["==", "class", "city"]],
        ],
        "layout": {
            "icon-image": { type: "interval", stops: [[0, "star-11"], [8, ""]] },
            "icon-size": 1,
            "text-anchor": { type: "interval", stops: [[0, "left"], [8, "center"]] },
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Metropolis Regular"],
            "text-justify": "left",
            "text-offset": [0.5, 0.2],
            "text-size": 14,
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "icon-opacity": 0.7,
            "text-color": "rgb(117, 129, 145)",
            "text-halo-blur": 1,
            "text-halo-color": "rgb(242,243,240)",
            "text-halo-width": 1,
        },
    },
    {
        id: "place_city_large",
        type: "symbol",
        source: mapSource,
        "source-layer": "place",
        "maxzoom": 12,
        "filter": [
            "all",
            ["==", "$type", "Point"],
            [
                "all",
                ["!=", "capital", 2],
                ["<=", "rank", 3],
                ["==", "class", "city"],
            ],
        ],
        "layout": {
            "icon-image": { type: "interval", stops: [[0, "circle-11"], [8, ""]] },
            "icon-size": 0.4,
            "text-anchor": { type: "interval", stops: [[0, "left"], [8, "center"]] },
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Metropolis Regular"],
            "text-justify": "left",
            "text-offset": [0.5, 0.2],
            "text-size": 14,
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "icon-opacity": 0.7,
            "text-color": "rgb(117, 129, 145)",
            "text-halo-blur": 1,
            "text-halo-color": "rgb(242,243,240)",
            "text-halo-width": 1,
        },
    },
    {
        id: "place_state",
        type: "symbol",
        source: mapSource,
        "source-layer": "place",
        "maxzoom": 12,
        "filter": ["all", ["==", "$type", "Point"], ["==", "class", "state"]],
        "layout": {
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Metropolis Regular"],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "text-color": "rgb(113, 129, 144)",
            "text-halo-blur": 1,
            "text-halo-color": "rgb(242,243,240)",
            "text-halo-width": 1,
        },
    },
    {
        id: "place_country_other",
        type: "symbol",
        source: mapSource,
        "source-layer": "place",
        "maxzoom": 8,
        "filter": [
            "all",
            ["==", "$type", "Point"],
            ["==", "class", "country"],
            ["!has", "iso_a2"],
        ],
        "layout": {
            "text-field": "{name:latin}",
            "text-font": ["Metropolis Light Italic"],
            "text-size": interpolateZoom({ z0: 9, z6: 11 }),
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "text-color": interpolateZoom({
                z3: "rgb(157,169,177)",
                z4: "rgb(153, 153, 153)",
            }),
            "text-halo-color": "rgba(236,236,234,0.7)",
            "text-halo-width": 1.4,
        },
    },
    {
        id: "place_country_minor",
        type: "symbol",
        source: mapSource,
        "source-layer": "place",
        "maxzoom": 8,
        "filter": [
            "all",
            ["==", "$type", "Point"],
            ["==", "class", "country"],
            [">=", "rank", 2],
            ["has", "iso_a2"],
        ],
        "layout": {
            "text-field": "{name:latin}",
            "text-font": ["Metropolis Regular"],
            "text-size": interpolateZoom({ z0: 10, z6: 12 }),
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "text-color": interpolateZoom({
                z3: "rgb(157,169,177)",
                z4: "rgb(153, 153, 153)",
            }),
            "text-halo-color": "rgba(236,236,234,0.7)",
            "text-halo-width": 1.4,
        },
    },
    // For now we don't need country names
    //   {
    //     id: "place_country_major",
    //     type: "symbol",
    //     source: mapSource,
    //     "source-layer": "place",
    //     "maxzoom": 6,
    //     "filter": [
    //       "all",
    //       ["==", "$type", "Point"],
    //       ["<=", "rank", 1],
    //       ["==", "class", "country"],
    //       ["has", "iso_a2"],
    //     ],
    //     "layout": {
    //       "text-anchor": "center",
    //       "text-field": "{name:latin}",
    //       "text-font": ["Metropolis Regular"],
    //       "text-size": interpolateZoom({0: 10, 3: 12, 4: 14}),
    //       "text-transform": "uppercase",
    //       "visibility": "visible",
    //     },
    //     "paint": {
    //       "text-color": interpolateZoom({z3: "rgb(157,169,177)", z4: "rgb(153, 153, 153)"}),
    //       "text-halo-color": "rgba(236,236,234,0.7)",
    //       "text-halo-width": 1.4,
    //     },
    //   },
    {
        id: "pedestrian_path",
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
            "line-color": "rgb(234, 234, 234)",
            "line-opacity": 0.9,
            "line-width": interpolateZoom({ z13: 1, z20: 10 }),
        },
    },
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
                ["boolean", ["feature-state", "hover"], false],
                "rgba(200, 100, 100, 1)",
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
                ["boolean", ["feature-state", "hover"], false],
                "rgba(200, 100, 100, 1)",
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
                ["boolean", ["feature-state", "hover"], false],
                "rgba(200, 100, 100, 1)",
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
                ["boolean", ["feature-state", "hover"], false],
                "rgba(200, 100, 100, 1)",
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
                ["boolean", ["feature-state", "hover"], false],
                "rgba(200, 100, 100, 1)",
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
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible",
        },
        "paint": {
            "text-color": "rgba(24, 79, 19, 1)",
            "text-halo-blur": 1,
            "text-halo-color": "rgba(231, 231, 131, 0.72)",
            "text-translate": [0, -10],
            "text-halo-width": 2,
        },
    },
];
