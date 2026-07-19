
import { scheduler } from "../../lib/cache-scheduler/scheduler";
import { Request, Response } from "express";
import * as cheerio from "cheerio";
// This file uses some of the tools that RIT provides that enable a near "real-time" tracking.
// Other locations have a static hourly set, while other more frequently visited locations may have dynamic schedules.

// Because of how varied these locations present their hours, each location requires a different behavior.

const CACHE_KEY = "live-hours";

/**
 * Fetches live hours for all locations in order:
 * Wiedman,
 * Wallace,
 * SHED (Atrium, General, Textile)
 */
const fetchLiveHours = async () => {
    let data: Record<string, any> = {}
    // ********************
    // Wiedman Logic
    // ********************
    let fitnessSite = await (await fetch("https://www.rit.edu/recreationwellness/facility-hours")).text();
    const $ = cheerio.load(fitnessSite);

    // Within ".facility-hours", find the ".card" whose <h3> contains "wiedman",
    // then select that <h3>'s parent.
    const wiedmanCard = $(".facility-hours .card")
        .find("h3")
        .filter((_i, el) => $(el).text().toLowerCase().includes("wiedman"))
        .first()
        .parent();

    // Parse the "seven-day-schedule" table: each <tr> holds a day (<th>) and its time (<td>).
    const wiedman: Record<string, any> = {};
    wiedmanCard.find("table.seven-day-schedule tbody tr").each((_i, row) => {
        // The current day is labeled e.g. "Sunday (Today)" — strip the "(Today)" tag.
        const day = $(row).find("th").text().replace(/\(Today\)/i, "").trim();
        const time = $(row).find("td").text().trim();
        if (day) wiedman[day] = time;
    });

    console.log(wiedman)
    data.wiedman = wiedman;

    // ********************
    // SHED Atrium Logic
    // ********************

    let libHours = await (await fetch("https://www.rit.edu/library/libhours")).text();
    const $2 = cheerio.load(libHours);

    // The schedule is a flat grid of headings followed by hours. The day-view
    // heading is Today; each week-view heading is another day. After every
    // heading the first ".hours" div is Wallace's (the rest are other libraries).
    const librarySchedule = $2(".heading.location-heading").first().parent();
    const wallace: Record<string, string> = {};
    librarySchedule.find(".day-view.heading, .week-view.heading").each((_i, heading) => {
        // The heading is "{day}<br>{date}" — keep the day, drop the date.
        const day = $2(heading).html()?.split(/<br\s*\/?>/i)[0].trim() ?? "";
        const firstHours = $2(heading).nextAll(".hours").first().text().trim();
        if (day) wallace[day] = firstHours;
    });

    data.wallace = wallace;

    // ********************
    // SHED Atrium Logic
    // ********************

    let shedAtrium = await (await fetch("https://make.rit.edu/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            { "operationName": "GetMakerspaceByID", "variables": { "id": "36" }, "query": "query GetMakerspaceByID($id: ID!) {\n  makerspaceByID(id: $id) {\n    id\n    hours {\n      day\n      makerspaceID\n      open\n      close\n      closed\n      __typename\n    }}\n}" }
        )
    })).json();

    // Normalize the GraphQL hours into the same "{day}: {time}" shape as the
    // scraped locations, so the response stays consistent across all buildings.
    const atrium: Record<string, string> = {};
    for (const h of shedAtrium?.data?.makerspaceByID?.hours ?? []) {
        // "day" is an ISO timestamp — take the weekday name (UTC to avoid shifting).
        const day = new Date(h.day).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
        atrium[day] = h.closed ? "Closed" : `${formatTime(h.open)}–${formatTime(h.close)}`;
    }

    data.atriumSHED = atrium;


    // ********************
    // SHED General Makerspace Logic
    // ********************

    let generalAtrium = await (await fetch("https://make.rit.edu/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            { "operationName": "GetMakerspaceByID", "variables": { "id": "37" }, "query": "query GetMakerspaceByID($id: ID!) {\n  makerspaceByID(id: $id) {\n    id\n    hours {\n      day\n      makerspaceID\n      open\n      close\n      closed\n      __typename\n    }}\n}" }
        )
    })).json();

    const general: Record<string, string> = {};
    for (const h of generalAtrium?.data?.makerspaceByID?.hours ?? []) {
        const day = new Date(h.day).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
        general[day] = h.closed ? "Closed" : `${formatTime(h.open)}–${formatTime(h.close)}`;
    }

    data.generalSHED = general;

    // ********************
    // SHED Textiles Logic
    // ********************

    let textilesSHED = await (await fetch("https://make.rit.edu/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            { "operationName": "GetMakerspaceByID", "variables": { "id": "38" }, "query": "query GetMakerspaceByID($id: ID!) {\n  makerspaceByID(id: $id) {\n    id\n    hours {\n      day\n      makerspaceID\n      open\n      close\n      closed\n      __typename\n    }}\n}" }
        )
    })).json();

    const textiles: Record<string, string> = {};
    for (const h of textilesSHED?.data?.makerspaceByID?.hours ?? []) {
        const day = new Date(h.day).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
        textiles[day] = h.closed ? "Closed" : `${formatTime(h.open)}–${formatTime(h.close)}`;
    }

    data.textilesSHED = textiles;

    console.log(data)
    return data;
};

// Converts a "HH:MM:SS" time into a compact label like "9am" or "5:30pm".
const formatTime = (t: string): string => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "pm" : "am";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return m ? `${hour12}:${String(m).padStart(2, "0")}${period}` : `${hour12}${period}`;
};

export const CACHEJOB = {
    key: CACHE_KEY,
    intervalMs: 1000 * 60 * 60,
    fetcher: fetchLiveHours
}

export const GET = (req: Request, res: Response) => {
    const cached = scheduler.getCache(CACHE_KEY);
    if (!cached) {
        return res.status(503).json({ error: "Cache is warming up, try again shortly." });
    }

    return res.header("Content-Type", "application/json").json({ cachetime: cached.cacheTime, data: cached.data });
};