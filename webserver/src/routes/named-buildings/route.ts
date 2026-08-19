import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { ScrapeCache } from "../../db/cache";

const scrapeCache = new ScrapeCache();

// GET /named-buildings/
export async function GET(req: Request, res: Response) {
    if (await scrapeCache.inCache("named-buildings") && !(await scrapeCache.isExpired("named-buildings"))) {
        res.send(await scrapeCache.getCache("named-buildings"));
        return;
    }

    const scrape = await fetch("https://www.rit.edu/whatsinaname/buildings");
    const html = await scrape.text();
    const $ = cheerio.load(html);

    var storedData: { name: string, code: string, image: string, link: string }[] = [];
    await Promise.all($('.view-content').find('.views-row').map(async (i, el) => {
        const name = $(el).find('.field--name-node-title a').text().trim();
        const relLink = $(el).find('.field--name-node-title a').attr("href") || "";
        const relImage = $(el).find('.field--name-field-rit-location-pic img').attr("src") || "";
        const link = relLink ? `https://www.rit.edu${relLink}` : "";
        const image = relImage ? `https://www.rit.edu${relImage}` : "";

        var code = "";
        if (link) {
            const detailScrape = await fetch(link);
            const $d = cheerio.load(await detailScrape.text());
            code = $d('h1.page-header .building-code').text().trim().replace(/[()]/g, "");
        }

        if (name) {
            storedData.push({ name, code, image, link });
        }
    }).get());

    await scrapeCache.setCache("named-buildings", storedData);

    res.send(await scrapeCache.getCache("named-buildings"));
}
