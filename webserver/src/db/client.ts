import {PrismaClient} from "@prisma/client"
import {PrismaPg} from "@prisma/adapter-pg"
import pg from "pg"

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
})

// This is the adapter for Prisma to talk to Postgres using the pg pool
const adapter = new PrismaPg(pool)

// One single PrismaClient instance for the whole app
let prisma: PrismaClient | null = null

// Function used to query DB anywhere that is needed (routes, services, etc.)
export function getPrisma() {
    if (!prisma) {
        // Lazy load so app can start without DB
        prisma = new PrismaClient({ adapter })
    }
    return prisma
}
