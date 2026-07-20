import { getPrisma } from "../../db/client";
import { ScrapeCache } from "../../db/cache";
import { Request, Response } from "express";
import * as cheerio from "cheerio";

// Define the structure of buildings
interface BuildingSchedule {
    id: number,
    name: string,
    link: string,
    hoursOfOperations?: { [day: string]: string[] } | null
}

const scrapeCache = new ScrapeCache();

scrapeBuildingHours("https://www.rit.edu/facilities/campus-center");

async function scrapeBuildingHours(url: string) {
    //need list of buildings to be defined here
    const prisma = getPrisma();
    const scrapeC = new ScrapeCache();

    const scrape = await fetch(url);
    const html = await scrape.text();
    const $ = cheerio.load(html);
    const rightColumn = $('.col-12.col-lg-3');

      // Find the Hours header inside that column
    const hoursHeader = rightColumn.find('h2.h5').filter((_, el) => {
        return $(el).text().trim() === "Hours";
      });

      // Collect all <p> tags until the next <h2>
    const hours: string[] = [];
    let node = hoursHeader.next();

    while (node.length && node[0].tagName !== "h2") {
        if (node[0].tagName === "p") {
            console.log(node.html()?.trim());
          hours.push(node.html()?.trim() ?? "");
        }
        node = node.next();
      }
    const { parsed, notes } = parseHoursBlocks(hours);
    const weekly = buildWeeklySchedule(parsed, notes);

    console.log(weekly);

    // // Cache this
    // await scrapeCache.setCache("building-hours", weekly);

    // res.json(weekly);

    // console.log(hours);
}

export async function GET(req: Request, res: Response) {

    //if cache is recent
    if (await scrapeCache.inCache("building-hours") && !(await scrapeCache.isExpired("building-hours"))){
        res.send(await scrapeCache.getCache("building-hours"));
        return;
    }
    //if not, get new data
    //reference function to get buildings data
    const scrape = await fetch("https://www.rit.edu/facilities/student-alumni-union");
    const html = await scrape.text();
    const $ = cheerio.load(html);
    // Find the column that contains the Hours section
      const rightColumn = $('.col-12.col-lg-3');

      // Find the Hours header inside that column
      const hoursHeader = rightColumn.find('h2.h5').filter((_, el) => {
        return $(el).text().trim() === "Hours";
      });

      if (!hoursHeader.length) return null;

      // Collect all <p> tags until the next <h2>
      const hours: string[] = [];
      let node = hoursHeader.next();

      while (node.length && node[0].tagName !== "h2") {
        if (node[0].tagName === "p") {
          hours.push(node.html()?.trim() ?? "");
        }
        node = node.next();
      }
    console.log(hours);
    //then set cache
}
// Student Alumni Union -> https://www.rit.edu/facilities/student-alumni-union
// Campus Center -> https://www.rit.edu/facilities/campus-center
// Monroe Hall -> https://www.rit.edu/facilities/monroe-hall
// Schmitt Interfaith Center -> https://www.rit.edu/facilities/kilian-j-and-caroline-f-schmitt-interfaith-center

const ALL_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function expandDayRange(dayRange: string): string[] {
  if (!dayRange.includes("-")) return [dayRange.trim()];

  const [start, end] = dayRange.split("-").map(d => d.trim());
  const startIdx = ALL_DAYS.indexOf(start);
  const endIdx = ALL_DAYS.indexOf(end);

  if (startIdx === -1 || endIdx === -1) return [dayRange];

  return ALL_DAYS.slice(startIdx, endIdx + 1);
}

function parseHoursBlocks(blocks: string[]) {
  const parsed: { day: string; time: string }[] = [];
  const notes: string[] = [];

  for (const block of blocks) {
    console.log(`Parsing block: ${block}`);
    const text = block
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Match "Monday - Thursday 7 a.m. - Midnight"
    const match = text.match(/([A-Za-z* -]+):+\s+(.*)/);

    
    console.log(match);
    if (match) {
      parsed.push({
        day: match[1].trim(),
        time: match[2].trim(),
      });
    } else {
      notes.push(text);
    }
  }

  return { parsed, notes };
}

function buildWeeklySchedule(parsed: { day: string; time: string }[], notes: string[]) {
  const schedule: Record<string, string> = {};

  // Initialize all days as empty
  for (const day of ALL_DAYS) {
    schedule[day] = "";
  }

  for (const entry of parsed) {
    const days = expandDayRange(entry.day);
    for (const d of days) {
      schedule[d] = entry.time;
    }
  }

  if (notes.length > 0) {
    schedule["notes"] = notes.join(" ");
  }

  return schedule;
}

// const { parsed, notes } = parseHoursBlocks(hours);
// const weekly = buildWeeklySchedule(parsed, notes);

// console.log(weekly);

// // Cache this
// await scrapeCache.setCache("building-hours", weekly);

// res.json(weekly);
