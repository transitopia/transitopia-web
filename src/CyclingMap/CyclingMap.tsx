import React from "react";

import { mapSource, layers, pathLayerIds, otherLayerIds } from "./cycling-map-layers.ts";
import { useMap, useMapLayerEvent } from "../Map/MapUtils.ts";
import { type MapCyclingElement, type MapParkingElement } from "../Map/MapData.ts";
import { MapOverlayWindow } from "../Map/MapOverlayWindow.tsx";

export const CyclingMap: React.FC = () => {

    const map = useMap();

    // Add the cycling data source and layers to the map:
    React.useEffect(() => {
        if (!map) return;
        for (const layer of layers) {
            map.addLayer(layer);
        }
        return () => {
            try {
                for (const layer of layers) {
                    if (map.getLayer(layer.id))
                        map.removeLayer(layer.id);
                }
            } catch {
                console.error("Unable to remove cycling layers. Perhaps map was already destroyed. This can happen in dev with hot reloading.");
            }
        }
    });

    const [selectedFeature, setSelectedFeature] = React.useState<MapCyclingElement | MapParkingElement>();
    const hoveredFeatureIdRef = React.useRef<string | undefined>(undefined);

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

    useMapLayerEvent("mousemove", handleMouseOver, ...pathLayerIds, ...otherLayerIds);
    useMapLayerEvent("mouseleave", handleMouseOut, ...pathLayerIds, ...otherLayerIds);

    const handleClick = React.useCallback((e: maplibregl.MapLayerEventType["click"]) => {
        const feature = e.features?.[0];
        if (!map || map.getZoom() < 13 || !feature) return;
        setSelectedFeature(
            { id: feature.id as string, type: "cycling_way", ...feature.properties } as MapCyclingElement
        );
    }, [map]);

    const handlePointClick = React.useCallback((e: maplibregl.MapLayerEventType["click"]) => {
        const feature = e.features?.[0];
        if (!map || map.getZoom() < 13 || !feature) return;
        setSelectedFeature(
            { id: feature.id as string, type: "bicycle_parking", ...(feature.properties as any) } as MapParkingElement
        );
    }, [map]);

    useMapLayerEvent("click", handleClick, ...pathLayerIds);
    useMapLayerEvent("click", handlePointClick, ...otherLayerIds);

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
            selectedFeature?.type === "cycling_way" ?
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
            : selectedFeature?.type === "bicycle_parking" ?
                <MapOverlayWindow className="top-24">
                    <div className="flex">
                        <div className="flex-1">
                            {selectedFeature.name ?
                                <><strong>{selectedFeature.name}</strong> (Bicycle Parking)</>
                                :
                                <strong>Bicycle Parking</strong>
                            }
                        </div>
                        <div className="flex-none">
                            <button className="hover:bg-gray-200 px-2 rounded-lg" onClick={() => setSelectedFeature(undefined)}>x</button>
                        </div>
                    </div>
                    {selectedFeature.capacity ? <div>Capacity: {selectedFeature.capacity} bikes.</div> : null}
                    <br />
                    <a className="text-slate-500 text-sm" href={`https://www.openstreetmap.org/node/${selectedFeature.id}`}>View or edit this entry on OpenStreetMap</a>
                </MapOverlayWindow>
            : null
        }
    </>
}
