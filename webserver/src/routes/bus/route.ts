import { Request, Response } from "express";
import { scrapeSchedules } from '../../lib/bus/scraper';
import { NormalizedResidenceSchedule, normalizeSchedules } from "../../lib/bus/normalizer";
import { ResidenceSchedule } from "@/types/bus";

export async function GET(req: Request, res: Response) {
    try {
        const data: ResidenceSchedule[] = await scrapeSchedules();
        let normalized: NormalizedResidenceSchedule[] = normalizeSchedules(data);
        res.send({
            data: normalized,
        });
    } catch (err) {
        res.status(500).send({
            error: "Failed to fetch bus schedules",
            message: err instanceof Error ? err.message : String(err)
        });
    }
}