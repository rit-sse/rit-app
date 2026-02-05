import * as cheerio from 'cheerio';
import {CheerioAPI} from 'cheerio';
import type {ResidenceSchedule} from '../../types/bus';

/**
 * Scrapes bus schedule data from RIT's campus shuttles webpage.
 *
 * Extracts residence locations and their associated bus routes from the HTML table
 * on https://www.rit.edu/parking/campus-shuttles. Each residence may have multiple
 * routes with different schedules.
 *
 * @returns Promise resolving to an array of residence schedules, where each contains:
 *   - name: The residence location (e.g., "Global Village", "Park Point")
 *   - routes: Array of route objects containing:
 *     - rId: Route ID number extracted from route text
 *     - routeName: Name of the shuttle route
 *     - timeRange: Operating hours (raw format from website)
 *     - days: Days of operation (raw format from website)
 */
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