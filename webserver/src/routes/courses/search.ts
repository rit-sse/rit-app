import { scheduler } from "../../lib/cache-scheduler/scheduler";
import { Request, Response } from "express";

const CACHE_KEY = "rit_courses";
const COURSES_URL = "https://academiccatalog.rit.edu/course-search/api/?page=fose&route=search";

export const HEADERS = {
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-US,en;q=0.6",
    "content-type": "application/json",
    "origin": "https://academiccatalog.rit.edu",
    "priority": "u=1, i",
    "referer": "https://academiccatalog.rit.edu/course-search/",
    "sec-ch-ua": '"Chromium";v="148", "Brave";v="148", "Not/A)Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    "x-requested-with": "XMLHttpRequest",
};

const fetchCourses = async (criteria: object[] = []) => {
    const response = await fetch(COURSES_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ other: { srcdb: "" }, criteria }),
    });

    return response.json();
};

export const CACHEJOB = {
    key: CACHE_KEY,
    intervalMs: 1000 * 60 * 60 * 24 * 4, // 4 days — course catalog changes infrequently
    fetcher: fetchCourses,
};

export const GET = async (req: Request, res: Response) => {
    const { q } = req.query;

    const cached = scheduler.getCache(CACHE_KEY);
    if (!cached) {
        return res.status(503).json({ error: "Cache is warming up, try again shortly." });
    }

    if (q) {
        const query = (q as string).toLowerCase();
        const filtered = cached.data.results.filter((course: any) => {
            return course.code.toLowerCase().startsWith(query) 
        });
        return res.header("Content-Type", "application/json").json({ cachetime: cached.cacheTime, data: { srcdb: cached.data.srcdb, count: filtered.length, results: filtered } });
    } else {
        return res.header("Content-Type", "application/json").json({ cachetime: cached.cacheTime, data: cached.data });
    }
};
