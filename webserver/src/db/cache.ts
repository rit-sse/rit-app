// TODO: Rework into memory?
import { getPrisma } from "./client"
import { PrismaClient } from "@prisma/client"

export class ScrapeCache {
    private prisma: PrismaClient = getPrisma();
    private EXPIRATION_TIME_MS: number = 1000 * 60 * 60; // 1 hour

    constructor() {
    }

    async inCache(code: string): Promise<boolean> {
        // return Object.keys(CacheSingleton.webCache).includes(code);
        let data = await this.prisma.webscrapeCache.findFirst({
            where: {
                cacheName: code
            }
        });
        if (data) {
            return true;
        }
        return false;
    }

    async isExpired(code: string): Promise<boolean> {
        let data = await this.prisma.webscrapeCache.findFirst({
            where: {
                cacheName: code
            }
        });
        if (data) {
            if (Date.now() < Number(data.expiry) + this.EXPIRATION_TIME_MS) {
                return false;
            }
        }
        return true;
    }

    async getCache(code: string): Promise<any> {
        let data = await this.prisma.webscrapeCache.findFirst({
            where: {
                cacheName: code
            }
        });
        if (data) {
            return {
                cachetime: Number(data?.cacheTime),
                data: data?.data
            }
        }
        return {}
    }

    async setCache(code: string, data: any): Promise<void> {
        let exists = await this.inCache(code);
        let expiry = Date.now() + this.EXPIRATION_TIME_MS;
        if (exists) {
            await this.prisma.webscrapeCache.updateMany({
                where: {
                    cacheName: code
                },
                data: {
                    data: data,
                    expiry: expiry
                }
            });
        } else {
            await this.prisma.webscrapeCache.create({
                data: {
                    cacheName: code,
                    data: data,
                    expiry: expiry,
                    cacheTime: Date.now()
                }
            });
        }
    }
}