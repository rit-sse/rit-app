import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { getPrisma } from "../../../db/client";
import { ScrapeCache } from "../../../db/cache";

// Prisma Client Setup
const prisma = getPrisma();

const scrapeCache = new ScrapeCache();

// I am using a map here to store building coordinates. I doubt buildings will ever grow legs and walk away.
const buildingCoordinates: {
  [buildingCode: string]: { lat: number; lon: number };
} = {};

// GET /dining/locations
export async function GET(req: Request, res: Response) {
  // // If cache exists and is recent (within 1 hour), return cached data
  if (
    (await scrapeCache.inCache("buildings")) &&
    !(await scrapeCache.isExpired("buildings"))
  ) {
    res.send(await scrapeCache.getCache("buildings"));
    return;
  }

  // Otherwise, scrape new data and update cache
  // Scrape dining locations from RIT website
  const scrape = await fetch(
    "https://www.rit.edu/facilitiesmanagement/buildings-maps",
  );

  // Get the HTML text from the response
  const html = await scrape.text();

  // Load HTML into Cheerio for parsing
  const $ = cheerio.load(html);

  // Data
  var storedData: {
    buildingNumber: string;
    buildingAbbreviations: string;
    buildingName: string;
    buildingImage: string;
    floorUrls: { [floorName: string]: string };
  }[] = [];
  await Promise.all(
    $(".view-content")
      .find("tbody")
      .find("tr")
      .map(async (i, el) => {
        // Extract building data from each table row
        const buildingNumber = $(el)
          .find('td[headers="view-field-building-number-table-column"]')
          .text()
          .trim();
        const buildingAbbreviations = $(el)
          .find('td[headers="view-field-abbreviation-s-table-column"]')
          .text()
          .trim();
        const buildingName = $(el).find("a").text().trim();
        const buildingURL = $(el).find("a").attr("href") || "";
        var buildingImage = "";
        var floorUrls: { [floorName: string]: string } = {};

        const buildingScrape = await fetch(`https://www.rit.edu${buildingURL}`);
        const $b = cheerio.load(await buildingScrape.text());

        // Get building image
        buildingImage =
          "https://www.rit.edu" +
            $b(".field--name-field-building-image").find("img").attr("src") ||
          "";
        console.log(`Building Image for ${buildingName}: ${buildingImage}`);

        $b("tbody")
          .find("tr")
          .map((j, row) => {
            const floorName = "floor" + $b(row).find("a").text().trim()[0];
            const floorMapLink = $b(row).find("a").attr("href") || "";
            if (floorName && floorMapLink) {
              floorUrls[floorName] = "https://www.rit.edu" + floorMapLink;
            }
          });

        storedData.push({
          buildingNumber,
          buildingAbbreviations,
          buildingName,
          buildingImage,
          floorUrls,
        });
      }),
  );

  await scrapeCache.setCache("buildings", storedData);

  res.send(await scrapeCache.getCache("buildings"));
}
