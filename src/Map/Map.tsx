import React from "react";

import { layers, mapSource } from "./transitopia-map-layers.ts";
import { MapContext, useMap, useMapLayerEvent } from "./MapUtils.ts";
import { MapCyclingElement } from "./MapData.ts";

/** Constrain a numeric value to a certain range */
const constrain = (value: number, min: number, max: number, def: number) => isNaN(value) ? def : value > max ? max : value < min ? min : value;
/** Where we load our map tiles from */
const sourceUrl = import.meta.env.VITE_MAP_TILES_CDN ?? "pmtiles://transitopia-bc.pmtiles";
// A global to track loading of pmtiles
let pmTilesInitialized = false;

export const MapWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [map, setMap] = React.useState<maplibregl.Map>();

    React.useEffect(() => {
        (async function () {
            // Load the map dependencies asynchronously via a separate bundle:
            const maplibregl = await import("maplibre-gl");
            if (sourceUrl.startsWith("pmtiles://") && !pmTilesInitialized) {
                // Load the "pmtiles" protocol that allows us to serve all the vector tiles for the map from a single large static .pmtiles file.
                const pmtiles = await import("pmtiles"); // Only import if we need to; not required in production when using a CDN
                const protocol = new pmtiles.Protocol();
                maplibregl.default.addProtocol("pmtiles", protocol.tile);
                pmTilesInitialized = true;
            }
            const initialUrl = new URL(location.href);
            const initialZoom = constrain(parseFloat(initialUrl.searchParams.get("z") ?? ""), 5, 20, 10);
            const initialLng = constrain(parseFloat(initialUrl.searchParams.get("lng") ?? ""), -140, -115, -122.94536684722912);
            const initialLat = constrain(parseFloat(initialUrl.searchParams.get("lat") ?? ""), 47, 60, 49.241584389313424);

            const map = new maplibregl.Map({
                container: 'map',
                zoom: initialZoom,
                center: [initialLng, initialLat], // starting position [lng, lat]
                style: {
                    version: 8,
                    name: "Transitopia",
                    glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
                    sprite: "https://openmaptiles.github.io/positron-gl-style/sprite",
                    sources: {
                        [mapSource]: {
                            type: "vector",
                            url: sourceUrl,
                            attribution: 'Map: <a href="https://openstreetmap.org">OpenStreetMap</a> + <a href="https://openmaptiles.org/">OpenMapTiles </a> + <a href="https://maplibre.org/">MapLibre</a>'
                        },
                    },
                    layers,
                }
            });
            setMap(map);
            map.getCanvas().style.cursor = 'default';

            const handleMapViewChanged = (() => {
                if (!map) return;
                const zoom = map.getZoom();
                const { lng, lat } = map.getCenter();
                const url = new URL(location.href);
                url.searchParams.set("z", zoom.toFixed(4));
                url.searchParams.set("lat", lat.toFixed(10));
                url.searchParams.set("lng", lng.toFixed(10));
                history.replaceState({ zoom, lng, lat }, "", url.pathname + url.search);
            });

            map.on("zoomend", handleMapViewChanged);
            map.on("moveend", handleMapViewChanged);
        })();
    }, []);

    return <MapContext.Provider value={{ map }}>
        <div id='map' className="w-screen h-screen"></div>
        {children};
    </MapContext.Provider>;
};

export const MapCore: React.FC = () => {

    const map = useMap();

    const [selectedFeature, setSelectedFeature] = React.useState<{ id: string, type: "cycling-way" } & MapCyclingElement>();
    const hoveredFeatureIdRef = React.useRef<string | undefined>();

    const handleMouseOver = React.useCallback((e: maplibregl.MapLayerEventType["mousemove"]) => {
        if (!map) return undefined;
        if (map.getZoom() < 13) return;
        const feature = e.features![0];
        if (feature.id !== hoveredFeatureIdRef.current) {
            if (hoveredFeatureIdRef.current) {
                map.removeFeatureState(
                    { source: mapSource, sourceLayer: "transitopia_cycling", id: hoveredFeatureIdRef.current },
                    "hover"
                );
            }
            hoveredFeatureIdRef.current = feature.id as string;
            map.setFeatureState(
                { source: mapSource, sourceLayer: "transitopia_cycling", id: feature.id },
                { hover: true },
            );
            map.getCanvas().style.cursor = 'pointer';
        }
    }, [map]);

    const handleMouseOut = React.useCallback(() => {
        if (!map) return undefined;
        if (hoveredFeatureIdRef.current) {
            map.removeFeatureState({ source: mapSource, sourceLayer: "transitopia_cycling", id: hoveredFeatureIdRef.current }, 'hover');
            hoveredFeatureIdRef.current = undefined;
        }
        map.getCanvas().style.cursor = 'default';
    }, [map]);

    useMapLayerEvent("mousemove", "cycling_path_1", handleMouseOver);
    useMapLayerEvent("mousemove", "cycling_path_2", handleMouseOver);
    useMapLayerEvent("mousemove", "cycling_path_3", handleMouseOver);
    useMapLayerEvent("mousemove", "cycling_path_4", handleMouseOver);
    useMapLayerEvent("mousemove", "cycling_path_construction", handleMouseOver);
    useMapLayerEvent("mouseleave", "cycling_path_1", handleMouseOut);
    useMapLayerEvent("mouseleave", "cycling_path_2", handleMouseOut);
    useMapLayerEvent("mouseleave", "cycling_path_3", handleMouseOut);
    useMapLayerEvent("mouseleave", "cycling_path_4", handleMouseOut);
    useMapLayerEvent("mouseleave", "cycling_path_construction", handleMouseOut);

    const handleClick = React.useCallback((e: maplibregl.MapLayerEventType["click"]) => {
        if (!map) return;
        if (map.getZoom() < 13) return;
        const feature = e.features![0];
        setSelectedFeature((prevSelectedFeature) => {
            if (prevSelectedFeature) {
                // Don't keep highlighting the previously selected feature:
                map.setFeatureState(
                    { source: mapSource, sourceLayer: "transitopia_cycling", id: prevSelectedFeature.id },
                    { selected: false },
                );
            }
            if (feature === undefined) return undefined; // This won't happen because we limit the event to features on our cycling layer
            map.setFeatureState(
                { source: mapSource, sourceLayer: "transitopia_cycling", id: feature.id },
                { selected: true },
            );
            return { id: feature.id as string, type: "cycling-way", ...(feature.properties as MapCyclingElement) };
        });
    }, [map]);

    useMapLayerEvent("click", "cycling_path_1", handleClick);
    useMapLayerEvent("click", "cycling_path_2", handleClick);
    useMapLayerEvent("click", "cycling_path_3", handleClick);
    useMapLayerEvent("click", "cycling_path_4", handleClick);
    useMapLayerEvent("click", "cycling_path_construction", handleClick);

    return <>
        {
            selectedFeature ?
                <div className="absolute w-96 h-60 bg-white z-50 top-5 left-5 border border-gray-500 rounded shadow-md p-2">
                    {selectedFeature.name ?
                        <><strong>{selectedFeature.name}</strong> ({`Cycling ${selectedFeature.class == "lane" ? "Lane" : "Track"}`})</>
                        :
                        <strong>{`Cycling ${selectedFeature.class == "lane" ? "Lane" : "Track"}`}</strong>
                    }
                    <br />
                    {selectedFeature.construction ? <span className="inline-block m-1 px-1 rounded-md bg-red-600 text-white">Under Construction</span> : null}
                    {selectedFeature.shared_with_vehicles ? <span className="inline-block m-1 px-1 rounded-md bg-red-600 text-white">shared with vehicles</span> : null}
                    {selectedFeature.shared_with_pedestrians ? <span className="inline-block m-1 px-1 rounded-md bg-yellow-200">shared with pedestrians</span> : null}
                    {selectedFeature.oneway == 1 ? <span className="inline-block m-1 px-1 rounded-md bg-yellow-200">one way</span> : null}
                    {
                        selectedFeature.class === "track" ? <span className="inline-block m-1 px-1 rounded-md bg-green-800 text-white">track (separated from roadway)</span> :
                            selectedFeature.class === "lane" && selectedFeature.shared_with_vehicles ? <span className="inline-block m-1 px-1 rounded-md bg-red-600 text-white">shared lane</span> :
                                <span className="inline-block m-1 px-1 rounded-md bg-yellow-200">bike lane on roadway</span>
                    }
                </div>
                : null
        }
    </>
}

export const Map: React.FC = () => {
    return <MapWrapper><MapCore /></MapWrapper>;
};