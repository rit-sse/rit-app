import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { ScrapeCache } from "../../db/cache";
import { geometryCentroid } from "../../utils/geo";

const scrapeCache = new ScrapeCache();

const CACHE_KEY = "named-buildings-v2";

// Coordinates from RIT's own campus map API (https://mapserver.rit.edu/api/locations?mdo_id=...),
// keyed by the mdo_id embedded in each whatsinaname building's detail page map iframe.
async function fetchBuildingCoordinates(mdoId: string): Promise<{ latitude: number, longitude: number } | null> {
    try {
        const res = await fetch(`https://mapserver.rit.edu/api/locations?mdo_id=${mdoId}`);
        const features = await res.json();
        return geometryCentroid(features?.[0]?.geometry);
    } catch {
        return null;
    }
}

// GET /named-buildings/
export async function GET(req: Request, res: Response) {
    if (await scrapeCache.inCache(CACHE_KEY) && !(await scrapeCache.isExpired(CACHE_KEY))) {
        res.send(await scrapeCache.getCache(CACHE_KEY));
        return;
    }

    const scrape = await fetch("https://www.rit.edu/whatsinaname/buildings");
    const html = await scrape.text();
    const $ = cheerio.load(html);

    var storedData: { name: string, code: string, image: string, link: string, latitude: number | null, longitude: number | null }[] = [];
    await Promise.all($('.view-content').find('.views-row').map(async (i, el) => {
        const name = $(el).find('.field--name-node-title a').text().trim();
        const relLink = $(el).find('.field--name-node-title a').attr("href") || "";
        const relImage = $(el).find('.field--name-field-rit-location-pic img').attr("src") || "";
        const link = relLink ? `https://www.rit.edu${relLink}` : "";
        const image = relImage ? `https://www.rit.edu${relImage}` : "";

        var code = "";
        var coordinates: { latitude: number, longitude: number } | null = null;
        if (link) {
            const detailScrape = await fetch(link);
            const $d = cheerio.load(await detailScrape.text());
            code = $d('h1.page-header .building-code').text().trim().replace(/[()]/g, "");

            const mapSrc = $d('.field--name-field-map-location iframe').attr('src') || '';
            const mdoMatch = mapSrc.match(/mdo_id=(\d+)/);
            if (mdoMatch) {
                coordinates = await fetchBuildingCoordinates(mdoMatch[1]);
            }
        }

        if (name) {
            storedData.push({ name, code, image, link, latitude: coordinates?.latitude ?? null, longitude: coordinates?.longitude ?? null });
        }
    }).get());

    await scrapeCache.setCache(CACHE_KEY, storedData);

    res.send(await scrapeCache.getCache(CACHE_KEY));
}
