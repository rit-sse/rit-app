import { Request, Response } from 'express';

export function GET(req: Request, res: Response) {
    const currentTime = new Date().toISOString();
    res.json({ time: currentTime });
}