import { Request, Response } from "express";
import { ScrapeCache } from "../../db/cache";
import * as cheerio from "cheerio";

const scrapeCache = new ScrapeCache();


export async function GET(req: Request, res: Response) {
    if(await scrapeCache.getCache("club_infos") && !(await scrapeCache.isExpired("club_infos"))) {
        return res.header("Content-Type", "application/json").send(await scrapeCache.getCache("club_infos"));
    }
    let clubPage = await (await fetch("https://campusgroups.rit.edu/club_signup?view=all&group_type=9999")).text();
    let $ = cheerio.load(clubPage);

    let clubList = $('.list-group-item').toArray();

    let parsedClubs: { [key: string]: any }[] = [];

    for (let club of clubList) {
        // Club Name Parser
        let clubName = $(club).find('.media-heading.header-cg--h4').text().trim();
        if (clubName === "") continue;

        // Club type (e.g., Academic, Sports, Cultural)
        let clubType = $(club).find('.h5.media-heading.grey-element').text().trim().replaceAll("\t", " ").replaceAll("\n", " ");
        clubType = clubType.replaceAll(/\s+/g, " ");

        // Mission Statement Parser
        let missionStatement = "";
        let missionStatementScan = $(club).find('p');
        for (let p of missionStatementScan.toArray()) {
            if ($(p).attr("onclick") && $(p).attr("onclick")!.includes("mission")) {
                missionStatement += $(p).text().trim() + " ";
            }
        }
        missionStatement = missionStatement.replaceAll("\t", " ").replaceAll("\n", " ");
        missionStatement = missionStatement.replaceAll(/\s+/g, " ");
        missionStatement = missionStatement.substring("Mission".length).trim();

        // Detect if the club is full/closed
        let fullClub = false;
        $(club).find('.checkbox.checkbox-cg--group').toArray().forEach(p => {
            if($(p).children().toArray().some(child => $(child).is('span'))) {
                fullClub = true;
            }
        });

        // Get image
        let clubImage = $(club).find('.media-object.media-object--bordered').attr('src') || '';
        clubImage = "https://static-prod-us-east-1.campusgroups.com" + clubImage;

        parsedClubs.push({
            name: clubName,
            type: clubType,
            website: $(club).find('a[aria-label=Website]').attr('href') || '',
            mission: missionStatement,
            closed: fullClub,
            image: clubImage
        })
    }   
    await scrapeCache.setCache("club_infos", parsedClubs);
    res.header("Content-Type", "application/json").send(await scrapeCache.getCache("club_infos"));
}