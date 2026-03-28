import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { ScrapeCache } from "../../db/cache";
import { writeFileSync } from "node:fs";

const scrapeCache = new ScrapeCache();

export async function GET(req: Request, res: Response) {
    const restaurantCode = req.query.restaurantCode as string;

    if (await scrapeCache.inCache(`restaurantdetail_${restaurantCode}`) && !await scrapeCache.isExpired(`restaurantdetail_${restaurantCode}`)) {
        res.send(await scrapeCache.getCache(`restaurantdetail_${restaurantCode}`));
        return;
    }

    let restaurantData: {
        name: string,
        visitingchefs?: any[],
        hoursOfOperations: { [day: string]: string[] }
    } = {
        name: "",
        visitingchefs: [],
        hoursOfOperations: {}
    };
    console.log(`https://www.rit.edu/dining/location/${restaurantCode}`)
    const scrape = await fetch(`https://www.rit.edu/dining/location/${restaurantCode}`,
        {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",

            }
        }
    );
    const html = await scrape.text();
    const hasChefData = html.includes("var chefData = JSON.parse");
    if (hasChefData) {
        let findChefDataLine = html.split("\n").find(line => line.includes("var chefData = JSON.parse"));

        let chefPriorParse = JSON.parse(findChefDataLine?.split("`")[1] || "{}");
        let chefData: {
            "event_id": number,
            "event_name": string,
            "event_type": string | null,
            "date": string,
            "menus": {
                "category": string,
                "name": string,
                "name_note": string,
                "description": string
            }[]
        }[] = chefPriorParse[Object.keys(chefPriorParse)[0]];

        const today = new Date();
        const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        chefData = chefData.map((chef: {
            "event_id": number,
            "event_name": string,
            "event_type": string | null,
            "date": string,
            "menus": {
                "category": string,
                "name": string,
                "name_note": string,
                "description": string
            }[]
        }) => {
            let chefDate = new Date(chef.date);
            if (yesterday <= chefDate) {
                return chef;
            }
        }).filter(chef => chef !== undefined);
        restaurantData.visitingchefs = chefData;
    }

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

    console.log(restaurantData)
    await scrapeCache.setCache(`restaurantdetail_${restaurantCode}`, restaurantData);
    await res.send(await scrapeCache.getCache(`restaurantdetail_${restaurantCode}`));
}