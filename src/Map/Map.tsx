import React from "react";

import { layers, mapSource } from "./basemap-layers.ts";
import { MapContext } from "./MapUtils.ts";

/** Constrain a numeric value to a certain range */
const constrain = (value: number, min: number, max: number, def: number) => isNaN(value) ? def : value > max ? max : value < min ? min : value;
/** Where we load our map tiles from */
const sourceUrl = import.meta.env.VITE_MAP_TILES_CDN ?? "pmtiles://transitopia-bc.pmtiles";
// A global to track loading of pmtiles
let pmTilesInitialized = false;

export const Map: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [map, setMap] = React.useState<maplibregl.Map>();

    React.useEffect(() => {
        const mapPromise = (async function () {
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

            return map;
        })();
        // Cleanup:
        return () => {
            mapPromise.then(map => map.remove());
        }
    }, []);

    return <MapContext.Provider value={{ map }}>
        <div id='map' className="w-screen h-screen"></div>
        {children};
    </MapContext.Provider>;
};
