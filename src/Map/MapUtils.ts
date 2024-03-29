import React from "react";
// import type maplibregl from "maplibre-gl";

export const MapContext: React.Context<{ map?: maplibregl.Map }> = React.createContext({});

export const MapLibreGLContext: React.Context<{ maplibregl?: typeof import("maplibre-gl") }> = React.createContext({});

export const useMap = () => React.useContext(MapContext)?.map;

/**
 * Register an event handler for a map event, but limited to a specific layer of the map
 * @param eventName The event to handle
 * @param layerName Which map layer to watch for the event
 * @param handler The handler to call
 */
export function useMapLayerEvent<eventName extends "click" | "mouseenter" | "mouseleave" | "mousemove">(eventName: eventName, layerName: string, handler: (event: maplibregl.MapLayerEventType[eventName]) => void) {
    const map = useMap();
    React.useEffect(() => {
        if (!map) return;
        map.on(eventName, layerName, handler);
        // Cleanup when the handler changes or the component is destroyed:
        return () => { map?.off(eventName, layerName, handler); };
    }, [map, eventName, layerName, handler]);
}

/**
 * Register an event handler for a map event
 * @param eventName The event to handle
 * @param handler The handler to call
 */
export function useMapEvent<eventName extends "load" | "zoomend" | "moveend">(eventName: eventName, handler: (event: maplibregl.MapEventType[eventName]) => void) {
    const map = useMap();
    React.useEffect(() => {
        if (!map) return;
        map.on(eventName, handler);
        // Cleanup when the handler changes or the component is destroyed:
        return () => { map?.off(eventName, handler); };
    }, [map, eventName, handler]);
}

/**
 * React hook to get the current zoom level of the map.
 * Using this hook will allow your component to update whenever the zoom changes.
 * Note that this only updates *after* the user has finished zooming, not during the zoom.
 * Updating throughout the zoom action has major performance problems.
 */
export function useMapZoom() {
    // Zoom to assume when we don't yet know the current zoom level of the map (it hasn't loaded yet):
    const defaultZoom = 14;
    const map = useMap();
    const [zoom, setZoom] = React.useState(map?.getZoom() ?? defaultZoom);
    const handler = React.useCallback(() => { setZoom(map?.getZoom() ?? defaultZoom); }, [map]);
    useMapEvent("zoomend", handler);
    useMapEvent("load", handler);
    return zoom;
}
