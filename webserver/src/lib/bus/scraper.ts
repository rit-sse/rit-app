import * as cheerio from 'cheerio';
import {CheerioAPI} from 'cheerio';
import type {Route, RouteSchedule, Stop} from '../../types/bus';


interface RouteMetadata extends Route {
    url: string;
}

/**
 * Scrapes route metadata from RIT's campus shuttles webpage.
 *
 * Extracts route information including URL, ID, name, operating hours, and days
 * from the main schedule table.
 *
 * @returns Promise resolving to an array of route metadata objects
 */
export async function scrapeRouteMetadata(): Promise<RouteMetadata[]> {
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

    // First, get all route links from the page, indexed by route ID
    const routeLinks = new Map<string, string>(); // Map of rId -> url
    $(".view-grouping-content a").each((_, el) => {
        const url = $(el).attr('href');
        const text = $(el).text().trim();
        if (url?.startsWith('/parking/')) {
            // Extract route ID from text (e.g., "11 Retail Shuttle" -> "11")
            const match = text.match(/^(\d+)\s+/);
            const rId = match?.[1];
            if (rId) {
                routeLinks.set(rId, url);
            }
        }
    });

    // Now get route metadata from table
    const routesMap = new Map<string, RouteMetadata>(); // Use map to deduplicate by rId
    const table = $("table").first();

    if (!table.length) {
        return [];
    }

    // Process each row in the table
    table.find("tbody tr").each((_, row) => {
        const cells = $(row).find("td");
        if (cells.length < 4) return;

        // Column 1: Route text (e.g., "3 Campus Connection Shuttle")
        const routeText = $(cells[1]).text().trim();

        // Column 2: Time range
        const timeRange = $(cells[2]).text().trim();

        // Column 3: Days
        const days = $(cells[3]).text().trim();

        // Extract route ID from text (e.g., "3 Campus Connection Shuttle" -> "3")
        const match = routeText.match(/^(\d+)\s+(.*)$/);
        const rId = match?.[1] ?? "";
        const routeName = match?.[2] ?? routeText;

        // Find matching URL by route ID
        const url = routeLinks.get(rId);

        if (!url) {
            console.log(`No URL found for route ID ${rId}: "${routeText}"`);
            return;
        }

        // Only add if we haven't seen this route ID before
        if (!routesMap.has(rId)) {
            routesMap.set(rId, {
                url,
                rId,
                routeName,
                timeRange,
                days
            });
        }
    });

    return Array.from(routesMap.values());
}

/**
 * Scrapes detailed stop times for a specific route
 *
 * @param metadata - Route metadata including URL and basic info
 * @returns Promise resolving to a complete RouteSchedule with stops
 */
export async function scrapeRouteDetails(metadata: RouteMetadata): Promise<RouteSchedule> {
    const fullUrl = `https://www.rit.edu${metadata.url}`
    const response = await fetch(fullUrl, {
        headers: {"User-Agent": "Mozilla/5.0"}
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch route details: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const stops: Stop[] = [];
    const table = $("table").first();

    if (!table.length) {
        return { ...metadata, stops };
    }

    // Get stop names
    const headers = table.find("thead th, tbody tr:first th");

    headers.each((_, el) => {
        const name = $(el).text().trim();
        if (name) {
            stops.push({name, times: []})
        }
    });

    // Get times for each stop
    table.find("tbody tr").each((_, row) => {
        const cells = $(row).find("td");

        cells.each((colIndex, cell) => {
            const time = $(cell).text().trim();
            if (time && stops[colIndex]) {
                stops[colIndex].times.push(time);
            }
        });
    });

    return { ...metadata, stops };
}
