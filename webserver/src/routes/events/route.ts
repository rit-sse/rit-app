import { scheduler } from "../../lib/cache-scheduler/scheduler";
import { Request, Response } from "express";
import * as cheerio from "cheerio";

const CACHE_KEY = "rit_events";
const INCREMENTS = 10;

const URLBuilder = (range: number) =>
    `https://campusgroups.rit.edu/mobile_ws/v17/mobile_events_list?range=${range}&limit=40`;

const fetchEvents = async () => {
    let eventParsed: { [key: string]: any }[] = [];
    let eventTags: string[] = [];

    for (let i = 0; i < INCREMENTS; i++) {
        let events = await (await fetch(URLBuilder(i * 40))).json();
        for (const event of events) {
            let eventData: { [key: string]: any } = {};
            let fields = event.fields.split(",");
            for (let x = 0; x < fields.length; x++) {
                if (fields[x].trim() == '') continue;
                eventData[fields[x]] = event[`p${x}`];
            }
            if (eventData["eventName"]) {
                let dates: string[] = [];
                for (const date of cheerio.load(eventData["eventDates"])("p")) {
                    let dateParse = cheerio.load(date).text().trim();
                    if (dateParse != "" && !dates.includes(dateParse)) {
                        dates.push(dateParse);
                    }
                }
                eventData["eventDates"] = dates.join(" ");
            }
            if (eventData["eventTags"]) {
                let allTags: string[] = [];
                for (const tag of cheerio.load(eventData["eventTags"])("a")) {
                    let tagParse = cheerio.load(tag).text().trim();
                    if (tagParse != "" && !eventTags.includes(tagParse)) {
                        eventTags.push(tagParse);
                    }
                    allTags.push(tagParse);
                }
                eventData["eventTags"] = allTags;
            }
            eventParsed.push(eventData);
        }
    }

    return { events: eventParsed, eventTags };
};

export const CACHEJOB = {
    key: CACHE_KEY,
    intervalMs: 1000 * 60 * 60, // 1 hour
    fetcher: fetchEvents,
};

export const GET = (_req: Request, res: Response) => {
    const cached = scheduler.getCache(CACHE_KEY);
    if (!cached) {
        return res.status(503).json({ error: "Cache is warming up, try again shortly." });
    }
    return res.header("Content-Type", "application/json").json({ cachetime: cached.cacheTime, data: cached.data });
};
