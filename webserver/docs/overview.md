# Webserver Overview

The RIT App webserver is an Express.js application written in TypeScript that serves as the backend API for the RIT mobile app. It scrapes and aggregates data from RIT's public websites and exposes it through a REST API.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript 5 |
| Database | PostgreSQL via Prisma ORM |
| HTML Parsing | Cheerio |
| Environment | `dotenv` |

## Project Structure

```
webserver/
├── src/
│   ├── App.ts              # Entry point, route loader
│   ├── db/
│   │   ├── client.ts       # Prisma client singleton
│   │   └── cache.ts        # ScrapeCache abstraction
│   ├── lib/
│   │   └── bus/            # Bus scraping & inference logic
│   ├── routes/             # File-based route modules
│   │   ├── bus/
│   │   ├── buildings/
│   │   ├── clubs/
│   │   ├── dining/
│   │   ├── events/
│   │   ├── report/
│   │   ├── health.ts
│   │   ├── news.ts
│   │   └── timeSign.ts
│   └── types/
│       └── bus.ts
├── prisma/
│   └── schema.prisma       # Database schema
├── docs/                   # This directory
└── package.json
```

## Routing System

Routes are loaded automatically at startup using a file-based system modeled after Next.js. The loader (`App.ts`) recursively scans `src/routes/` and registers handlers based on exported function names:

- A file or folder named `route.ts` maps to the directory path (e.g., `routes/dining/route.ts` → `GET /dining/`)
- Other `.ts` files map to their filename (e.g., `routes/dining/menu.ts` → `GET /dining/menu`)
- Exported `GET`, `POST`, `PUT`, `DELETE` functions are registered automatically

## Running the Server

```bash
# Install dependencies
npm install

# Build and start
npm run start

# Build only
npm run build

# Validate Prisma schema and regenerate client
npm run prisma:check
```

The server listens on `PORT` from the environment, defaulting to `3000`.

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `3000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `DISCORD_WEBHOOK_FOR_APP_REPORTS` | Discord webhook URL for user reports |

## Caching

All scraped data is cached in PostgreSQL via the `ScrapeCache` class. The default expiry is **3 hours**. See [caching.md](caching.md) for details.
