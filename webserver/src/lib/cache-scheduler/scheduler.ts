import { PrismaClient } from "@prisma/client";
import { getPrisma } from "../../db/client";

type CacheJob = {
    key: string;
    intervalMs: number;
    fetcher: () => Promise<any>;
    timer?: ReturnType<typeof setInterval>;
};

type CacheEntry = {
    data: any;
    cacheTime: number;
};

const OVERLY_OUTDATED_MS = 1000 * 60 * 60 * 24 * 7; // 1 week

export class CacheScheduler {
    private prisma: PrismaClient = getPrisma();
    private store: Map<string, CacheEntry> = new Map();
    private jobs: { [key: string]: CacheJob } = {};

    registerLoop(key: string, intervalMs: number, fetcher: () => Promise<any>): void {
        if (this.jobs[key]) return;
        this.jobs[key] = { key, intervalMs, fetcher };
    }

    getCache(key: string): CacheEntry | null {
        const entry = this.store.get(key) ?? null;
        if (entry && Date.now() - entry.cacheTime > OVERLY_OUTDATED_MS) return null;
        return entry;
    }

    start(): void {
        // Seed in-memory store from persisted DB entries so the first requests
        // are served immediately, before the initial fetcher runs finish.
        this.seed();
        for (const job of Object.values(this.jobs)) {
            this.run(job);
            job.timer = setInterval(() => this.run(job), job.intervalMs);
        }
    }

    async __forceRefresh(key: string): Promise<void> {
        const job = this.jobs[key];
        if (!job) throw new Error(`No registered cache job for key: "${key}"`);
        await this.run(job);
    }

    stop(): void {
        for (const job of Object.values(this.jobs)) {
            if (job.timer) clearInterval(job.timer);
        }
    }

    private async seed(): Promise<void> {
        const entries = await this.prisma.webscrapeCache.findMany({
            where: { cacheName: { in: Object.keys(this.jobs) } },
        });
        for (const entry of entries) {
            if (!this.store.has(entry.cacheName)) {
                this.store.set(entry.cacheName, {
                    data: entry.data,
                    cacheTime: Number(entry.cacheTime),
                });
            }
        }
    }

    private async run(job: CacheJob): Promise<void> {
        const data = await job.fetcher();
        const cacheTime = Date.now();
        const expiry = cacheTime + job.intervalMs;

        this.store.set(job.key, { data, cacheTime });

        const exists = await this.prisma.webscrapeCache.findFirst({
            where: { cacheName: job.key },
        });
        if (exists) {
            await this.prisma.webscrapeCache.updateMany({
                where: { cacheName: job.key },
                data: { data, expiry, cacheTime },
            });
        } else {
            await this.prisma.webscrapeCache.create({
                data: { cacheName: job.key, data, expiry, cacheTime },
            });
        }
    }
}

export const scheduler = new CacheScheduler();
