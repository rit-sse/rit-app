import * as cheerio from 'cheerio';
import type { Route } from '../../types/bus';
import {CheerioAPI} from "cheerio";

export async function scrapeSchedules(): Promise<Route[]> {
    const scraper: Response = await fetch("https://www.rit.edu/parking/campus-shuttles", {
        headers: {
            "User-Agent": "Mozilla/5.0",
        },
    });

    if (!scraper.ok) {
        throw new Error(`Failed to fetch RIT's bus schedule: ${scraper.status}`)
    }
    const html: string = await scraper.text();
    const $: CheerioAPI = cheerio.load(html);

    let rId = 0;
    const routes: Route[] = [];

    $(".views-row").each((_, routeEl) => {
        const routeName = $(routeEl)
            .find("h2, h3")
            .first()
            .text()
            .trim();

        if (!routeName) return;

        const stops: Route["stops"] = [];

        $(routeEl)
            .find("table tr")
            .each((_, row) => {
                const cells = $(row).find("td");
                if (cells.length === 0) return;

                const name = $(cells[0]).text().trim();
                if(!name) return;

                const times: string[] = cells
                    .slice(1)
                    .map((_, td) => $(td).text().trim())
                    .get()
                    .filter(Boolean);

                stops.push({ name, times });
            });

        if (stops.length > 0) {
            routes.push({
                rId: rId++,
                routeName,
                stops
            });
        }
    });

    return routes;

}