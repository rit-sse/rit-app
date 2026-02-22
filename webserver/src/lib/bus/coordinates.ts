import type {StopCoordinate} from "../../types/bus";

// Approximate coordinates for all currently known shuttle stops.
const STOP_COORDINATES: Record<string, Omit<StopCoordinate, "source">> = {
    "blot": {lat: 43.08112, lon: -77.66384},
    "dlot": {lat: 43.08643, lon: -77.66412},
    "ghlot": {lat: 43.08752, lon: -77.66878},
    "gleasoncirclearrival": {lat: 43.08495, lon: -77.6742},
    "gleasoncircledeparture": {lat: 43.08495, lon: -77.6742},
    "globalvillage": {lat: 43.08288, lon: -77.67711},
    "jeffersonplace": {lat: 43.0822, lon: -77.66535},
    "klot": {lat: 43.08489, lon: -77.66126},
    "ntid": {lat: 43.08471, lon: -77.66727},
    "northbusstop": {lat: 43.08704, lon: -77.67058},
    "parkpointnorth": {lat: 43.0817, lon: -77.67149},
    "parkpointretail": {lat: 43.08091, lon: -77.67089},
    "parkpointsouth": {lat: 43.07995, lon: -77.66985},
    "perkinsgreen": {lat: 43.0853, lon: -77.66669},
    "perkinsrd": {lat: 43.08476, lon: -77.66722},
    "residencehalls": {lat: 43.08318, lon: -77.66473},
    "riverknoll": {lat: 43.08672, lon: -77.68288},
    "ritinn": {lat: 43.06443, lon: -77.67745},
    "slaughterhall": {lat: 43.08612, lon: -77.66957},
    "techparkdr": {lat: 43.07908, lon: -77.65165},
    "theprovince": {lat: 43.08052, lon: -77.66406},
    "ucwest": {lat: 43.0842, lon: -77.67895},
};

function normalizeStopName(stopName: string): string {
    return stopName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

const STOP_ALIASES: Record<string, string> = {
    "ghlot": "ghlot",
    "ghparkinglot": "ghlot",
    "gleasoncircle": "gleasoncirclearrival",
    "perkinsroad": "perkinsrd",
    "perkinsrd": "perkinsrd",
    "perkinsrdstop": "perkinsrd",
    "reshall": "residencehalls",
    "residencehall": "residencehalls",
    "theprovinceapartments": "theprovince",
};

function resolveStopKey(stopName: string): string {
    const normalized = normalizeStopName(stopName);
    return STOP_ALIASES[normalized] ?? normalized;
}

export function getCanonicalStopKey(stopName: string): string {
    return resolveStopKey(stopName);
}

export function getStopCoordinate(stopName: string): StopCoordinate | null {
    const resolvedStopKey = resolveStopKey(stopName);
    const coordinate = STOP_COORDINATES[resolvedStopKey];

    if (!coordinate) {
        return null;
    }

    return {
        ...coordinate,
        source: "STOP_APPROX",
    };
}

export function getMissingStopNames(stopNames: string[]): string[] {
    const missingStops = new Set<string>();

    for (const stopName of stopNames) {
        if (!getStopCoordinate(stopName)) {
            missingStops.add(stopName);
        }
    }

    return Array.from(missingStops).sort((a, b) => a.localeCompare(b));
}
