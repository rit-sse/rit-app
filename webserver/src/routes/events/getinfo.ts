import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { ScrapeCache } from "../../db/cache";

const scrapeCache = new ScrapeCache();

const EVENT_URL = "https://campusgroups.rit.edu/rsvp_boot?"

export async function GET(req: Request, res: Response) {
    const eventID = req.query.eventID as string;
    
    if(await scrapeCache.inCache(`event-info-${eventID}`) && !(await scrapeCache.isExpired(`event-info-${eventID}`))) {
        return res.status(200).json(await scrapeCache.getCache(`event-info-${eventID}`));
    }
    let data = await (await fetch(`${EVENT_URL}id=${eventID}`)).text()

    const $ = cheerio.load(data);
    // FIND THAT SCRIPT WITH THE INFO IN IT!!!
    let allScripts = $("script").toArray();
    let targetScript = allScripts.find(script => $(script).attr("type") === "application/ld+json");
    if (!targetScript) {
        return res.status(404).json({ error: "Event data not found" });
    }

    let scriptContent = $(targetScript).html()!;
    let resp = JSON.parse(scriptContent)

    if($('.rsvp__event-price').length > 0) {
        resp.price = $('.rsvp__event-price').first().text().trim();
    }
    if($('.rsvp__event-org').length > 0) {
        resp.organizer = $('.rsvp__event-org').find('button').text().trim();
    }

    await scrapeCache.setCache(`event-info-${eventID}`, resp);
    res.status(200).json(await scrapeCache.getCache(`event-info-${eventID}`));
}