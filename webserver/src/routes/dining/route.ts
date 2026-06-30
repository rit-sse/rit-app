import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { scheduler } from "../../lib/cache-scheduler/scheduler";

interface RestaurantType {
    id: number,
    name: string,
    type: string,
    open: boolean,
    code: string,
    link: string,
    image: string,
    bannerImage: string,
    busyLevel: number | null,
    hoursOfOperations?: { [day: string]: string[] } | null
}

const CACHE_KEY = "dining_locations";
const types = ["restaurant", "market", "coffee", "grocery"];

const fetchDining = async () => {
    const scrape = await fetch("https://www.rit.edu/dining/locations");
    const $ = cheerio.load(await scrape.text());

    let onId = 0;
    let restaurants: RestaurantType[] = [];

    for (const t of types) {
        $(`li[data-dining-type="${t}"]`).map((i, el) => {
            const name = $(el).find('.font-weight-bold').text();
            const status = $(el).find('.status-text').text();
            const link = $(el).find('a').attr("href");
            const imageURL = $(el).find('.location-image').find("img").attr("src") || "";
            const busyLevel = $(el).find('img[alt="Density"]').attr("src")?.split("people-")[1][0] || null;

            restaurants.push({
                id: onId++,
                name: name.trim(),
                type: t,
                open: status.startsWith("Open") || status.startsWith("Closing Soon"),
                code: link?.split("location/")[1] || "",
                image: "https://rit.edu" + imageURL,
                busyLevel: busyLevel ? parseInt(busyLevel) : null,
                link: "https://rit.edu" + link || "",
                bannerImage: ""
            });
        });
    }

    for (let i = 0; i < restaurants.length; i++) {
        const r = restaurants[i];
        if (!r.code) continue;

        const $storeScrape = cheerio.load(await (await fetch(r.link)).text());

        $storeScrape('div[class="week-display"]').map((_j, el) => {
            $storeScrape(el).find('div[class="day-column"]').map((_k, dayEl) => {
                const dayName = $storeScrape(dayEl).find('div[class="day-name"]').text().trim();
                const hours = $storeScrape(dayEl).find('div[class="day-hours"]').html()?.split("<br>");
                if (!r.hoursOfOperations) r.hoursOfOperations = {};
                if (!Object.keys(r.hoursOfOperations).includes(dayName)) {
                    r.hoursOfOperations[dayName] = hours?.map((e) => e.trim()) || [];
                }
            });
        });

        $storeScrape("#banner-item-2").map((_x, el) => {
            const src = $storeScrape(el).find("img").attr("src");
            if (src) restaurants[i].bannerImage = "https://rit.edu" + src;
        });
    }

    return { data: restaurants };
};

export const CACHEJOB = {
    key: CACHE_KEY,
    intervalMs: 1000 * 60 * 30, // 30 minutes — keeps open/close status reasonably fresh
    fetcher: fetchDining,
};

// GET /dining/locations
export function GET(_req: Request, res: Response) {
    const cached = scheduler.getCache(CACHE_KEY);
    if (!cached) {
        return res.status(503).json({ error: "Cache is warming up, try again shortly." });
    }
    return res.header("Content-Type", "application/json").json({ cachetime: cached.cacheTime, data: cached.data });
}
