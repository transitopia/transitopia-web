/**
 * Data included for cycling tracks/lanes in the Transitopia Cycling layer of our map.
 */
export interface MapCyclingElement {
    id: string;
    type: "cycling_way";
    name?: string;
    construction?: boolean;
    shared_with_pedestrians: boolean;
    shared_with_vehicles: boolean;
    surface?: string,
    class: "lane" | "track";
    comfort: 4 | 3 | 2 | 1;
    oneway: 0 | 1;

    // Mostly for things under construction:
    website?: string;
    opening_date?: string;
}

export interface MapParkingElement {
    id: string;
    type: "bicycle_parking",
    amenity: "bicycle_parking"; // TODO: or "kick-scooter_parking"
    bicycle_parking?: "stands" | "wall_loops" | "rack" | "shed" | string; // TODO: validate this in planetiler to restrict to known values
    name?: string;
    operator?: string;
    indoor?: "yes" | "no";
    access?: "private" | "customers" | "members";
    capacity?: number;
    covered?: "yes" | "no" | string;
    cyclestreets_id?: string;
    fee?: "yes" | "no"; // There are more details potentially available from "fee:conditional" but we don't support that yet.
}
