import { ScrapeCache } from "../../db/cache";
import { Request, Response } from "express";

export const GET = async (req: Request, res: Response) => {

    const scrapeCache = new ScrapeCache();
    if(await scrapeCache.getCache("rit_events") && !(await scrapeCache.isExpired("rit_events"))) {
        return res.header("Content-Type", "application/json").send(await scrapeCache.getCache("rit_events"));
    }

    const events = await (await fetch("https://campusgroups.rit.edu/mobile_ws/v17/mobile_events_list?range=0&limit=40")).json();

    let eventParsed: { [key: string]: any }[] = [];
    // Parse event
    for(const event of events) {
        let eventData: { [key: string]: any } = {}
        let fields = event.fields.split(",");
        for(let x = 0; x < fields.length; x++) {
            if(fields[x].trim() == '') continue;
            eventData[fields[x]] = event[`p${x}`];
        }
        eventParsed.push(eventData);
    }
    console.log(eventParsed)
    await scrapeCache.setCache("rit_events", eventParsed);
    res.header("Content-Type", "application/json").send(await scrapeCache.getCache("rit_events"));
}