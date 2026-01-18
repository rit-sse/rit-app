import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/client";

interface RestaurantType {
    id: number,
    name: string,
    type: string,
    open: boolean,
    code: string,
    link: string,
    image: string,
    busyLevel: number | null,
    hoursOfOperations?: string[] | null
}

const adapter = new PrismaPg({
    connectionString: process.env.DIRECT_DATABASE_URL || ""
});
const prisma = new PrismaClient({
    adapter
});

const types = ["restaurant", "market", "coffee", "grocery"];

const _debugKeepRefreshing = true;

// GET /dining/locations
export async function GET(req: Request, res: Response) {

    // Check database cache for dining locations
    let databaseCache = await prisma.webscrapeCache.findFirst({
        where: {
            cacheName: "dining_locations"
        }
    });

    // If cache exists and is recent (within 1 hour), return cached data
    if (databaseCache && !_debugKeepRefreshing) {
        const cacheTime = databaseCache.cacheTime;
        const currentTime = Date.now();
        const cacheDuration = 1000 * 60 * 60; // 1 hour
        if (currentTime - cacheTime < cacheDuration) {
            // Return cached data
            const cachedData: RestaurantType[] = JSON.parse(databaseCache.data);
            res.send({
                cacheTime: cacheTime,
                data: cachedData
            });
            return;
        }
    }

    // Otherwise, scrape new data and update cache
    // Scrape dining locations from RIT website
    const scrape = await fetch("https://www.rit.edu/dining/locations");

    // Get the HTML text from the response
    const html = await scrape.text();

    const $ = cheerio.load(html);
    let onId = 0;

    let restaurants: RestaurantType[] = [];
    // let restaurants: string[] = [];

    for (const t of types) {
        $(`li[data-dining-type="${t}"]`).map((i, el) => {
            const name = $(el).find('.font-weight-bold').text()
            const status = $(el).find('.status-text').text();
            const link = $(el).find('a').attr("href")
            const imageURL = $(el).find('.location-image').find("img").attr("src") || "";
            const busyLevel = $(el).find('img[alt="Density"]').attr("src")?.split("people-")[1][0] || null;
            console.log(busyLevel)
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

    // Update database cache
    const newCacheData = JSON.stringify(restaurants);
    const currentTime = Date.now();

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