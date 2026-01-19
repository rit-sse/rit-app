import {Request, Response} from 'express';
import {getPrisma} from '../db/client';

export async function GET(req: Request, res: Response) {
    let prisma = getPrisma();
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({
            status: "ok",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.log("Error connecting to DB:", err);
        res.status(503).json({
            status: "degraded",
        });
    }
}