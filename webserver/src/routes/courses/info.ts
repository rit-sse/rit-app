import { Request, Response } from "express";
import { HEADERS } from "./search";

const INFO_URL = "https://academiccatalog.rit.edu/course-search/api/?page=fose&route=details";

export const GET = async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: "Missing required query param: code" });
    }

    const response = await fetch(INFO_URL, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
            group: `code:${code}`,
            key: `code:${code}`,
            srcdb: "2026",
            matched: `code:${code}`,
        }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
};
