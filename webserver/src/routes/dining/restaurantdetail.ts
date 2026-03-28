import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { ScrapeCache } from "../../db/cache";
import { writeFileSync } from "node:fs";

const scrapeCache = new ScrapeCache();

export async function GET(req: Request, res: Response) {
    const restaurantCode = req.query.restaurantCode as string;

    if (await scrapeCache.inCache(`restaurant_${restaurantCode}`) && !await scrapeCache.isExpired(`restaurant_${restaurantCode}`)) {
        res.send(await scrapeCache.getCache(`restaurant_${restaurantCode}`));
        return;
    }

    let restaurantData: {
        name: string,
        visitingchefs?: string[],
        hoursOfOperations: { [day: string]: string[] }
    } = {
        name: "",
        visitingchefs: [],
        hoursOfOperations: {}
    };
    const scrape = await fetch(`https://www.rit.edu/dining/location/${restaurantCode}`);
    writeFileSync("restaurant.txt", await scrape.text());
    const html = await scrape.text();
    const $ = cheerio.load(html);

    // Restaurant Name
    restaurantData.name = $(".hero-container").text().trim();

    // Parse hours of operation by getting the week display div, taking all the day columns, and then iterating through them
    $('div[class="week-display"]').map((j, el) => {
        $(el).find('div[class="day-column"]').map((k, dayEl) => {
            let dayName = $(dayEl).find('div[class="day-name"]').text().trim();
            let hours = $(dayEl).find('div[class="day-hours"]').html()?.split("<br>");
            console.log(dayName, hours?.map((e) => e.trim()));
            // Initialize hoursOfOperations object if it doesn't exist for whatever reason (shouldn't happen)
            if (!restaurantData.hoursOfOperations) {
                restaurantData.hoursOfOperations = {};
            }
            // restaurantData.hoursOfOperations[dayName] = hours;
            if (!Object.keys(restaurantData.hoursOfOperations).includes(dayName)) {
                restaurantData.hoursOfOperations[dayName] = hours?.map((e) => e.trim()) || [];
            }
        })
    });

    // Visiting Chefs (if they exist)
    $('.visiting-chefs-container').map((i, el) => {
        console.log(el)
        $(el).find('li').map((j, chefEl) => {
            restaurantData.visitingchefs?.push($(chefEl).text().trim());
        })
    });

    console.log(restaurantData)

    await res.send(restaurantData);
}