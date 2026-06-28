import { Request, Response } from "express";
import { scheduler } from "../../lib/cache-scheduler/scheduler";
import * as cheerio from "cheerio";

const CACHE_KEY = "club_infos";

const fetchClubs = async () => {
    const clubPage = await (await fetch("https://campusgroups.rit.edu/club_signup?view=all&group_type=9999")).text();
    const $ = cheerio.load(clubPage);

    const parsedClubs: { [key: string]: any }[] = [];

    for (const club of $('.list-group-item').toArray()) {
        const clubName = $(club).find('.media-heading.header-cg--h4').text().trim();
        if (clubName === "") continue;

        let clubType = $(club).find('.h5.media-heading.grey-element').text().trim().replaceAll("\t", " ").replaceAll("\n", " ");
        clubType = clubType.replaceAll(/\s+/g, " ");

        let missionStatement = "";
        for (const p of $(club).find('p').toArray()) {
            if ($(p).attr("onclick")?.includes("mission")) {
                missionStatement += $(p).text().trim() + " ";
            }
        }
        missionStatement = missionStatement.replaceAll("\t", " ").replaceAll("\n", " ");
        missionStatement = missionStatement.replaceAll(/\s+/g, " ");
        missionStatement = missionStatement.substring("Mission".length).trim();

        const fullClub = $(club).find('.checkbox.checkbox-cg--group').toArray()
            .some(p => $(p).children().toArray().some(child => $(child).is('span')));

        let clubImage = $(club).find('.media-object.media-object--bordered').attr('src') || '';
        clubImage = "https://static-prod-us-east-1.campusgroups.com" + clubImage;

        const passwordLocked = $(club).find('.listing-element__title-block').text().includes("Group password");

        parsedClubs.push({
            name: clubName,
            type: clubType,
            website: $(club).find('a[aria-label=Website]').attr('href') || '',
            mission: missionStatement,
            closed: fullClub,
            image: clubImage,
            isPasswordLocked: passwordLocked
        });
    }

    return parsedClubs;
};

export const CACHEJOB = {
    key: CACHE_KEY,
    intervalMs: 1000 * 60 * 60 * 6, // 6 hours — club listings change infrequently
    fetcher: fetchClubs,
};

export function GET(_req: Request, res: Response) {
    const cached = scheduler.getCache(CACHE_KEY);
    if (!cached) {
        return res.status(503).json({ error: "Cache is warming up, try again shortly." });
    }
    return res.header("Content-Type", "application/json").json({ cachetime: cached.cacheTime, data: cached.data });
}
