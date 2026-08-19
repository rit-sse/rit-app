import { Request, Response } from "express";
import { ScrapeCache } from "../../db/cache";
import { geometryCentroid } from "../../utils/geo";

const scrapeCache = new ScrapeCache();

const CACHE_KEY = "campus-locations";

// GET /campus-locations/
export async function GET(req: Request, res: Response) {
    if (await scrapeCache.inCache(CACHE_KEY) && !(await scrapeCache.isExpired(CACHE_KEY))) {
        res.send(await scrapeCache.getCache(CACHE_KEY));
        return;
    }

    // RIT's own campus location database - every location, not just the
    // named/historic buildings, so search results are inherently scoped to campus.
    const scrape = await fetch("https://mapserver.rit.edu/api/locations?search");
    const features = await scrape.json();

    const storedData: { name: string, abbreviation: string, latitude: number | null, longitude: number | null, tag: string[], menus: string[] }[] = [];
    for (const feature of features) {
        const coordinates = geometryCentroid(feature?.geometry);
        const properties = feature?.properties ?? {};

        if (properties.name) {
            storedData.push({
                name: properties.name,
                abbreviation: properties.abbreviation ?? "",
                latitude: coordinates?.latitude ?? null,
                longitude: coordinates?.longitude ?? null,
                tag: properties.tag ?? [],
                menus: properties.menus ?? [],
            });
        }
    }

    await scrapeCache.setCache(CACHE_KEY, storedData);

    res.send(await scrapeCache.getCache(CACHE_KEY));
}
