
import { scheduler } from "../../lib/cache-scheduler/scheduler";
import { Request, Response } from "express";
import * as cheerio from "cheerio";
// This file uses some of the tools that RIT provides that enable a near "real-time" tracking.
// Other locations have a static hourly set, while other more frequently visited locations may have dynamic schedules.

export interface BuildingLocation {
    id: number;
    name: string;
    /** RIT facilities page to scrape the Hours block from. */
    url: string;
}

const CACHE_KEY = "building-hours";

const fetchBuildings = async () => {
    let data = await (await fetch("https://www.rit.edu/facilities")).text();
    
    const $ = cheerio.load(data);

    // document.getElementsByClassName("row list-style-none")[0].children
    const listItems = $(".row.list-style-none").first().children("li");

    const buildings: { title: string; link: string; image: string }[] = [];
    listItems.each((_i, el) => {
        const title = $(el).find(".card-title").text().trim();
        const about = $(el).find("article").attr("about") ?? "";
        const link = about ? `https://www.rit.edu${about}` : "";

        const image = $(el).find("img.card-img-top").attr("src") ?? "";

        if (title) buildings.push({ title, link, image });
    });

    return buildings;
};

export const CACHEJOB = {
    key: CACHE_KEY,
    intervalMs: 1000 * 60 * 60,
    fetcher: fetchBuildings
}

export const GET = (req: Request, res: Response) => {
    const cached = scheduler.getCache(CACHE_KEY);
    if (!cached) {
        return res.status(503).json({ error: "Cache is warming up, try again shortly." });
    }

    let data = cached.data as { title: string; link: string; image: string }[];

    const q = (req.query.q as string | undefined)?.trim().toLowerCase();
    if (q) {
        data = data.filter((b) => b.title.toLowerCase().includes(q));
    }

    return res.header("Content-Type", "application/json").json({ cachetime: cached.cacheTime, data });
};