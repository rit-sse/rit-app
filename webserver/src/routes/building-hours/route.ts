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

//need list of buildings to be defined here

const prisma = getPrisma();
const scrapeCache = new ScrapeCache();

function getBuildingHours(){
    //need to scrape the building info and put into interfaces
    //then return it to GET
    }

export async function GET(req: Request, res: Response) {

    //if cache is recent
    if (await scrapeCache.inCache("building-hours") && !(await scrapeCache.isExpired("building-hours"){
        res.send(await scrapeCache.getCache("building-hours"));
        return;
    }
    //if not, get new data
    //reference function to get buildings data

    //then set cache

// Student Alumni Union -> https://www.rit.edu/facilities/student-alumni-union
// Cmapus Center -> https://www.rit.edu/facilities/campus-center
// Monroe Hall -> https://www.rit.edu/facilities/monroe-hall
// Schmitt Interfaith Center -> https://www.rit.edu/facilities/kilian-j-and-caroline-f-schmitt-interfaith-center

// Student Alumni Union, Campus Center, Monroe Hall, Schmitt Interfaith Center
// Sunday	8 a.m. - midnight
// Monday-Thursday	7 a.m. - midnight
// Friday	7 a.m. - 1 a.m.
// Saturday	8 a.m. - 1 a.m.