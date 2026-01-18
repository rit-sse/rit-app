import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/client";

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
    hoursOfOperations?: {[day: string]: string} | null
}
// Define the dining types to scrape
const types = ["restaurant", "market", "coffee", "grocery"];

// Prisma Client Setup
const adapter = new PrismaPg({
    connectionString: process.env.DIRECT_DATABASE_URL || ""
});
const prisma = new PrismaClient({
    adapter
});


// GET /dining/locations
export async function GET(req: Request, res: Response) {

    // Check database cache for dining locations
    let databaseCache = await prisma.webscrapeCache.findFirst({
        where: {
            cacheName: "dining_locations"
        }
    });

    // // If cache exists and is recent (within 1 hour), return cached data
    // if (databaseCache) {
    //     const cacheTime = databaseCache.cacheTime;
    //     const currentTime = Date.now();
    //     const cacheDuration = 1000 * 60 * 60; // 1 hour
    //     if (currentTime - cacheTime < cacheDuration) {
    //         // Return cached data
    //         const cachedData: RestaurantType[] = JSON.parse(databaseCache.data);
    //         res.send({
    //             cacheTime: cacheTime,
    //             data: cachedData
    //         });
    //         return;
    //     }
    // }

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
        const r = restaurants[i];
        console.log(`Fetching hours for ${r.name}...`);
        if (r.code) {
            const detailScrape = await fetch(`${r.link}`);
            const $storeScrape = cheerio.load(await detailScrape.text());
            $storeScrape('div[class="week-display"]').map((j, el) => {
               $(el).find('div[class="day-column"]').map((k, dayEl) => {
                let dayName = $storeScrape(dayEl).find('div[class="day-name"]').text().trim();
                let hours = $storeScrape(dayEl).find('div[class="day-hours"]').text().trim();
                if (!r.hoursOfOperations) {
                    r.hoursOfOperations = {};
                }
                r.hoursOfOperations[dayName] = hours;
               })
            });
        }
    }

    // Update database cache
    const newCacheData = JSON.stringify(restaurants);
    const currentTime = Date.now();

    // If cache exists, update it; otherwise, create a new cache entry
    if (databaseCache) {
        // Update existing cache
        await prisma.webscrapeCache.update({
            where: {
                id: databaseCache.id
            },
            data: {
                data: newCacheData,
                cacheTime: currentTime
            }
        });
    } else {
        // Create new cache entry
        await prisma.webscrapeCache.create({
            data: {
                cacheName: "dining_locations",
                data: newCacheData,
                cacheTime: currentTime
            }
        });
    }

    // Return newly scraped data
    res.send({
        cacheTime: currentTime,
        data: restaurants
    });
}