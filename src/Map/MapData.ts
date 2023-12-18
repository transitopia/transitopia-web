/**
 * Data included for cycling tracks/lanes in the Transitopia Cycling layer of our map.
 */
export interface MapCyclingElement {
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
