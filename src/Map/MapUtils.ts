import React from "react";
// import type maplibregl from "maplibre-gl";

export const MapContext: React.Context<{ map?: maplibregl.Map }> = React.createContext({});

export const useMap = () => React.useContext(MapContext)?.map;

/**
 * Register an event handler for a map event, but limited to a specific layer of the map
 * @param eventName The event to handle
 * @param layerName Which map layer to watch for the event
 * @param handler The handler to call
 */
export function useMapLayerEvent<eventName extends "click">(eventName: eventName, layerName: string, handler: (event: maplibregl.MapLayerEventType[eventName]) => void) {
    const map = useMap();
    React.useEffect(() => {
        if (!map) return;
        map.on(eventName, layerName, handler);
        // Cleanup when the handler changes or the component is destroyed:
        return () => { map?.off(eventName, layerName, handler); };
    })
}

/**
 * Register an event handler for a map event
 * @param eventName The event to handle
 * @param handler The handler to call
 */
export function useMapEvent<eventName extends "zoomend" | "moveend">(eventName: eventName, handler: (event: maplibregl.MapEventType[eventName]) => void) {
    const map = useMap();
    React.useEffect(() => {
        if (!map) return;
        map.on(eventName, handler);
        // Cleanup when the handler changes or the component is destroyed:
        return () => { map?.off(eventName, handler); };
    })
}
