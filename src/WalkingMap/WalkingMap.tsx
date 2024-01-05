import React from "react";

import { layers } from "./walking-map-layers.ts";
import { useMap, useMapZoom } from "../Map/MapUtils.ts";

export const WalkingMap: React.FC = () => {

    const map = useMap();
    const zoom = useMapZoom();

    // Add the walking layers to the map:
    React.useEffect(() => {
        if (!map) return;
        for (const layer of layers) {
            map.addLayer(layer);
        }
        return () => {
            for (const layer of layers) {
                map.removeLayer(layer.id);
            }
        }
    });

    return <>
        <div className="absolute w-96 h-30 bg-white z-50 top-24 left-5 border border-gray-500 rounded shadow-md p-2">
            The Transitopia walking map is not yet developed, but for now you can see
            all the known pedestrian paths from OpenStreetMap.
        </div>
        {
            zoom < 14 ?
                <div className="absolute w-96 h-30 bg-white z-50 top-48 left-5 border border-gray-500 rounded shadow-md p-2 font-bold">
                    Zoom in to see walkways.
                </div>
            : null
        }
    </>;
}
