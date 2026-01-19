import {PrismaClient} from "@prisma/client"
import {PrismaPg} from "@prisma/adapter-pg"
import pg from "pg"

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

let prisma: PrismaClient | null = null

export function getPrisma() {
    if (!prisma) {
        prisma = new PrismaClient({ adapter })
    }
    return prisma
}
