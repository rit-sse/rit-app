
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
    // SHED Makerspaces (Atrium, General, Textiles)
    // ********************

    data.atriumSHED = await fetchMakerspaceHours("36");
    data.generalSHED = await fetchMakerspaceHours("37");
    data.textilesSHED = await fetchMakerspaceHours("38");

    console.log(data)
    return data;
};

// Fetches a SHED makerspace's hours from the GraphQL API and normalizes them
// into the same "{day}: {time}" shape as the scraped locations, so the response
// stays consistent across all buildings.
const fetchMakerspaceHours = async (id: string): Promise<Record<string, string>> => {
    const res = await (await fetch("https://make.rit.edu/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            { "operationName": "GetMakerspaceByID", "variables": { id }, "query": "query GetMakerspaceByID($id: ID!) {\n  makerspaceByID(id: $id) {\n    id\n    hours {\n      day\n      makerspaceID\n      open\n      close\n      closed\n      __typename\n    }}\n}" }
        )
    })).json();

    const hours: Record<string, string> = {};
    for (const h of res?.data?.makerspaceByID?.hours ?? []) {
        // "day" is an ISO timestamp — take the weekday name (UTC to avoid shifting).
        const day = new Date(h.day).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
        hours[day] = h.closed ? "Closed" : `${formatTime(h.open)}–${formatTime(h.close)}`;
    }
    return hours;
};

// Converts a "HH:MM:SS" time into a compact label like "9am" or "5:30pm".
const formatTime = (t: string): string => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "pm" : "am";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return m ? `${hour12}:${String(m).padStart(2, "0")}${period}` : `${hour12}${period}`;
};

const ALL_DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

// Parses a compact label like "9am", "5:30pm", "noon" or "7 p.m." into minutes
// past midnight. Returns null when the label isn't a time at all.
const parseTimeLabel = (label: string): { minutes: number; hadMeridiem: boolean } | null => {
    const text = label.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

    if (text === "noon") return { minutes: 12 * 60, hadMeridiem: true };
    if (text === "midnight") return { minutes: 0, hadMeridiem: true };

    const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
    if (!match) return null;

    const hour = Number(match[1]);
    const minute = match[2] ? Number(match[2]) : 0;
    const meridiem = match[3];

    if (hour > 23 || minute > 59) return null;

    // Without a meridiem the hour is taken as-is; the caller may correct it from
    // the other end of the range (e.g. the "9" in "9 - 5pm").
    if (!meridiem) return { minutes: hour * 60 + minute, hadMeridiem: false };

    const hour24 = meridiem === "pm" ? (hour % 12) + 12 : hour % 12;
    return { minutes: hour24 * 60 + minute, hadMeridiem: true };
};

// Turns a day's raw hours string into [open, close] minutes past midnight.
// A close time at or before the open time means the range runs past midnight,
// so close is pushed into the next day (e.g. "7pm - 1am" -> [1140, 1500]).
// Returns null for "Closed", empty values, and anything unparseable.
const parseHoursRange = (raw: string): [number, number] | null => {
    const text = (raw ?? "").toLowerCase().replace(/\s+/g, " ").trim();
    if (!text || text.includes("closed")) return null;
    if (/24\s*hours?/.test(text)) return [0, 24 * 60];

    const parts = text.split(/\s*(?:–|—|-|\bto\b)\s*/).filter(Boolean);
    if (parts.length < 2) return null;

    const open = parseTimeLabel(parts[0]);
    const close = parseTimeLabel(parts[1]);
    if (!open || !close) return null;

    const openMinutes = open.minutes;

    // "9am - 5": a bare close hour that lands before the open time is the
    // afternoon one. The reverse ("1 - 8pm") is genuinely ambiguous, so a bare
    // open hour is left as written.
    let closeMinutes = close.minutes;
    if (!close.hadMeridiem && closeMinutes < openMinutes) {
        closeMinutes += 12 * 60;
    }
    if (closeMinutes <= openMinutes) {
        closeMinutes += 24 * 60;
    }

    return [openMinutes, closeMinutes];
};

// Decides whether a location is open right now, using the server's clock.
// Checks today's range, then yesterday's in case it runs past midnight.
const isOpenAt = (hours: Record<string, string>, now: Date): boolean => {
    const minutes = now.getHours() * 60 + now.getMinutes();
    const todayIndex = now.getDay();

    const today = parseHoursRange(hours[ALL_DAYS[todayIndex]]);
    if (today && minutes >= today[0] && minutes < today[1]) return true;

    const yesterday = parseHoursRange(hours[ALL_DAYS[(todayIndex + 6) % 7]]);
    if (yesterday && yesterday[1] > 24 * 60 && minutes < yesterday[1] - 24 * 60) return true;

    return false;
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

    // "closed" is derived per-request rather than cached alongside the hours,
    // since the cache only refreshes hourly and would otherwise go stale.
    const now = new Date();
    const locations = cached.data as Record<string, Record<string, string>>;
    const data = Object.fromEntries(
        Object.entries(locations).map(([name, hours]) => [
            name,
            { hours, closed: !isOpenAt(hours, now) },
        ])
    );

    return res.header("Content-Type", "application/json").json({ cachetime: cached.cacheTime, data });
};