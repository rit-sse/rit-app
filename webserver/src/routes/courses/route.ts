import { Request, Response } from "express";

const COURSES_URL = "https://academiccatalog.rit.edu/course-search/api/?page=fose&route=search";

export const GET = async (_req: Request, res: Response) => {
    const response = await fetch(COURSES_URL, {
        method: "POST",
        headers: {
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
        },
        body: JSON.stringify({ other: { srcdb: "" }, criteria: [] }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
};
