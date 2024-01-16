import React from "react";

import { mapSource, layers } from "./cycling-map-layers.ts";
import { useMap, useMapLayerEvent } from "../Map/MapUtils.ts";
import { MapCyclingElement } from "../Map/MapData.ts";
import { MapOverlayWindow } from "../Map/MapOverlayWindow.tsx";

export const CyclingMap: React.FC = () => {

    const map = useMap();

    // Add the cycling layers to the map:
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

    React.useEffect(() => {
        // When leaving the cycling map, clean up the hover state:
        return () => {
            if (!map) return;
            if (hoveredFeatureIdRef.current) {
                map.removeFeatureState({ source: mapSource, sourceLayer: "transitopia_cycling", id: hoveredFeatureIdRef.current }, 'hover');
            }
        }
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
        setSelectedFeature(
            feature === undefined ? undefined : // This won't happen because we limit the event to features on our cycling layer
            { id: feature.id as string, type: "cycling-way", ...(feature.properties as MapCyclingElement) }
        );
    }, [map]);

    useMapLayerEvent("click", "cycling_path_1", handleClick);
    useMapLayerEvent("click", "cycling_path_2", handleClick);
    useMapLayerEvent("click", "cycling_path_3", handleClick);
    useMapLayerEvent("click", "cycling_path_4", handleClick);
    useMapLayerEvent("click", "cycling_path_construction", handleClick);

    React.useEffect(() => {
        if (!map) return;
        if (selectedFeature) {
            map.setFeatureState(
                { source: mapSource, sourceLayer: "transitopia_cycling", id: selectedFeature.id },
                { selected: true },
            );
            return () => {
                map.removeFeatureState({ source: mapSource, sourceLayer: "transitopia_cycling", id: selectedFeature.id }, 'selected');
            }
        }
    }, [map, selectedFeature]);

    return <>
        {
            selectedFeature ?
                <MapOverlayWindow className="top-24">
                    <div className="flex">
                        <div className="flex-1">
                            {selectedFeature.name ?
                                <><strong>{selectedFeature.name}</strong> ({`Cycling ${selectedFeature.class == "lane" ? "Lane" : "Track"}`})</>
                                :
                                <strong>{`Cycling ${selectedFeature.class == "lane" ? "Lane" : "Track"}`}</strong>
                            }
                        </div>
                        <div className="flex-none">
                            <button className="hover:bg-gray-200 px-2 rounded-lg" onClick={() => setSelectedFeature(undefined)}>x</button>
                        </div>
                    </div>
                    {selectedFeature.construction ? <span className="inline-block m-1 px-1 rounded-md bg-red-600 text-white">Under Construction</span> : null}
                    {selectedFeature.shared_with_vehicles ? <span className="inline-block m-1 px-1 rounded-md bg-red-600 text-white">shared with vehicles</span> : null}
                    {selectedFeature.shared_with_pedestrians ? <span className="inline-block m-1 px-1 rounded-md bg-yellow-200">shared with pedestrians</span> : null}
                    {selectedFeature.oneway == 1 ? <span className="inline-block m-1 px-1 rounded-md bg-yellow-200">one way</span> : null}
                    {
                        selectedFeature.class === "track" ? <span className="inline-block m-1 px-1 rounded-md bg-green-800 text-white">track (separated from roadway)</span> :
                            selectedFeature.class === "lane" && selectedFeature.shared_with_vehicles ? <span className="inline-block m-1 px-1 rounded-md bg-red-600 text-white">shared lane</span> :
                                <span className="inline-block m-1 px-1 rounded-md bg-yellow-200">bike lane on roadway</span>
                    }
                </MapOverlayWindow>
                : null
        }
    </>
}
