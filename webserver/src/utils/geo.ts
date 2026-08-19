// Centroid of a GeoJSON geometry from RIT's own campus map API
// (https://mapserver.rit.edu/api/locations?...), which returns either a
// Point (already a single coordinate) or a Polygon (a ring of vertices).
export function geometryCentroid(geometry: any): { latitude: number, longitude: number } | null {
    if (!geometry) {
        return null;
    }

    if (geometry.type === "Point") {
        const [lon, lat] = geometry.coordinates as [number, number];
        return { latitude: lat, longitude: lon };
    }

    const ring: [number, number][] | undefined = geometry.coordinates?.[0];
    if (!ring || ring.length === 0) {
        return null;
    }

    const sum = ring.reduce((acc, [lon, lat]) => ({ lon: acc.lon + lon, lat: acc.lat + lat }), { lon: 0, lat: 0 });
    return { latitude: sum.lat / ring.length, longitude: sum.lon / ring.length };
}
