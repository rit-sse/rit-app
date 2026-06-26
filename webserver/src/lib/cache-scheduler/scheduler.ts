import { ScrapeCache } from "../../db/cache";
import { PrismaClient } from "@prisma/client"
import {getPrisma} from "../../db/client"


type CacheJob = {
    key: string;
    intervalMs: number;
    fetcher: () => Promise<any>;
    timer?: ReturnType<typeof setInterval>;
};

// This is going to use a Singleton pattern to manage cache jobs. The CacheScheduler will be responsible for scheduling and executing cache jobs at specified intervals. Each job will have a unique key, an interval in milliseconds, and a fetcher function that retrieves the data to be cached. The scheduler will use the ScrapeCache class to store and retrieve cached data.
export class CacheScheduler {
    private cache: ScrapeCache = new ScrapeCache();
    private jobs: { [key: string]: CacheJob } = {};

    registerLoop(key: string, intervalMs: number, fetcher: () => Promise<any>): void {
        if (this.jobs[key]) return;
        this.jobs[key] = { key, intervalMs, fetcher };
    }

    start(): void {
        for (const job of Object.values(this.jobs)) {
            this.run(job);
            job.timer = setInterval(() => this.run(job), job.intervalMs);
        }
    }

    stop(): void {
        for (const job of Object.values(this.jobs)) {
            if (job.timer) clearInterval(job.timer);
        }
    }

    private async run(job: CacheJob): Promise<void> {
        const data = await job.fetcher();
        await this.cache.setCache(job.key, data);
    }
}
