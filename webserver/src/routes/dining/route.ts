import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { getPrisma } from "../../db/client";
import { ScrapeCache } from "../../db/cache";

// Define the structure of a restaurant type
interface RestaurantType {
    id: number,
    name: string,
    type: string,
    open: boolean,
    code: string,
    link: string,
    image: string,
    busyLevel: number | null,
    hoursOfOperations?: { [day: string]: string } | null
}
// Define the dining types to scrape
const types = ["restaurant", "market", "coffee", "grocery"];

// Prisma Client Setup
const prisma = getPrisma();

const scrapeCache = new ScrapeCache();

// GET /dining/locations
export async function GET(req: Request, res: Response) {

    // // If cache exists and is recent (within 1 hour), return cached data
    if (await scrapeCache.inCache("dining_locations") && !(await scrapeCache.isExpired("dining_locations"))) {
        res.send(await scrapeCache.getCache("dining_locations"));
        return;
    }

    // Otherwise, scrape new data and update cache
    // Scrape dining locations from RIT website
    const scrape = await fetch("https://www.rit.edu/dining/locations");

    // Get the HTML text from the response
    const html = await scrape.text();

    // Load HTML into Cheerio for parsing
    const $ = cheerio.load(html);
    // Initialize restaurant ID counter
    let onId = 0;

    // Initialize array to hold restaurant data
    let restaurants: RestaurantType[] = [];

    // Loop through each dining type and extract restaurant data
    for (const t of types) {
        $(`li[data-dining-type="${t}"]`).map((i, el) => {
            const name = $(el).find('.font-weight-bold').text()
            const status = $(el).find('.status-text').text();
            // Link to restaurant details page
            const link = $(el).find('a').attr("href")
            const imageURL = $(el).find('.location-image').find("img").attr("src") || "";
            // Extract busy level from image's file name. This looks like an interesting way to do it, but it works.
            const busyLevel = $(el).find('img[alt="Density"]').attr("src")?.split("people-")[1][0] || null;

            // Push restaurant data to array
            restaurants.push({
                id: onId++,
                name: name.trim(),
                type: t,
                open: status.startsWith("Open"),
                code: link?.split("location/")[1] || "",
                image: "https://rit.edu" + imageURL,
                busyLevel: busyLevel ? parseInt(busyLevel) : null,
                link: "https://rit.edu" + link || ""
            });
        })
    }

    // Get hours of operation for each restaurant
    for (let i = 0; i < restaurants.length; i++) {
        // Get restaurant
        const r = restaurants[i];

        // Only fetch hours if restaurant has a valid code
        if (r.code) {
            // Fetch restaurant detail page
            const detailScrape = await fetch(`${r.link}`);
            // Load detail page HTML into Cheerio
            const $storeScrape = cheerio.load(await detailScrape.text());

            // Parse hours of operation by getting the week display div, taking all the day columns, and then iterating through them
            $storeScrape('div[class="week-display"]').map((j, el) => {
                $(el).find('div[class="day-column"]').map((k, dayEl) => {
                    let dayName = $storeScrape(dayEl).find('div[class="day-name"]').text().trim();
                    let hours = $storeScrape(dayEl).find('div[class="day-hours"]').text().trim();
                    // Initialize hoursOfOperations object if it doesn't exist for whatever reason (shouldn't happen)
                    if (!r.hoursOfOperations) {
                        r.hoursOfOperations = {};
                    }
                    r.hoursOfOperations[dayName] = hours;
                })
            });
        }
    }

    // Update database cache
    const currentTime = Date.now();

    await scrapeCache.setCache("dining_locations", {
        data: restaurants
    });

    // Return newly scraped data
    res.send({
        data: restaurants
    });
}