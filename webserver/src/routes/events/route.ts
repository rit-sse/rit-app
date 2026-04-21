import { ScrapeCache } from "../../db/cache";
import { Request, Response } from "express";

import * as cheerio from "cheerio";

const URLBuilder = async(range: number) => {
  return `https://campusgroups.rit.edu/mobile_ws/v17/mobile_events_list?range=${range}&limit=40`;
}

const getEventData = async (increments: number) => {
    let eventParsed: { [key:string] : string}[] = []
    let eventTags: string[] = []
    for(let i = 0; i < increments; i++) {
      let events = await (await fetch(await URLBuilder(i*40))).json();
      // Parse event
      for(const event of events) {
          let eventData: { [key: string]: any } = {}
          let fields = event.fields.split(",");
          for(let x = 0; x < fields.length; x++) {
              if(fields[x].trim() == '') continue;
              eventData[fields[x]] = event[`p${x}`];
          }
          if (eventData["eventName"]) {
              let dates: string[] = [];
              // eventData["eventDates"] = cheerio.load(eventData["eventDates"]).teHH
              for(const date of cheerio.load(eventData["eventDates"])("p")) {
                  let dateParse = cheerio.load(date).text().trim();
                  if(dateParse != "" && !dates.includes(dateParse)) {
                      dates.push(dateParse);
                  }
              }
              eventData["eventDates"] = dates.join(" ");;
          }
          if (eventData["eventTags"]) {
              let allTags: string[] =[];
              for(const tag of cheerio.load(eventData["eventTags"])("a")) {
                  let tagParse = cheerio.load(tag).text().trim();
                  if(tagParse != "" && !eventTags.includes(tagParse)) {
                      eventTags.push(tagParse);
                  }
                  allTags.push(tagParse);
              }
              eventData["eventTags"] = allTags;
          }
          eventParsed.push(eventData);
      }
    }
    return {eventParsed, eventTags};
}
export const GET = async (req: Request, res: Response) => {

    const scrapeCache = new ScrapeCache();
    if(await scrapeCache.getCache("rit_events") && !(await scrapeCache.isExpired("rit_events"))) {
        return res.header("Content-Type", "application/json").send(await scrapeCache.getCache("rit_events"));
    }

    let cacheDataSet: {[key: string]: any } = {}

    let increments = 10;
    let resp = await getEventData(increments);
    let eventParsed = resp.eventParsed;
    let eventTags = resp.eventTags;

    cacheDataSet["events"] = eventParsed;
    cacheDataSet["eventTags"] = eventTags;

    console.log(JSON.stringify(cacheDataSet, null, 2));

    await scrapeCache.setCache("rit_events", cacheDataSet);
    res.header("Content-Type", "application/json").send(await scrapeCache.getCache("rit_events"));
}
