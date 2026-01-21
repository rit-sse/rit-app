import * as cheerio from 'cheerio';
import {CheerioAPI} from 'cheerio';
import type {ResidenceSchedule} from '../../types/bus';

export async function scrapeSchedules(): Promise<ResidenceSchedule[]> {
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

    let schedules: ResidenceSchedule[] = [];
    let currentResidence: ResidenceSchedule | null = null;

    const table = $("table").first();
    if (!table.length) return [];


    table.find("tbody tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length < 4) return;

        const residence = $(cells[0])
            .text()
            .replace(/\u00a0/g, "")
            .trim();

        const routeText = $(cells[1]).text().trim();
        const timeRange = $(cells[2]).text().trim();
        const days = $(cells[3]).text().trim();

        if (residence) {
            currentResidence = {
                name: residence,
                routes: [],
            };
            schedules.push(currentResidence);
        }

        if (!currentResidence) return;

        const match = routeText.match(/^(\d+)\s+(.*)$/);

        currentResidence.routes.push({
            rId: match?.[1] ?? "",
            routeName: match?.[2] ?? routeText,
            timeRange,
            days,
        });
    });

    return schedules;

}