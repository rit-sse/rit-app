# Caching

The server caches all scraped data in PostgreSQL to avoid hammering external RIT websites on every request.

## How It Works

The `ScrapeCache` class ([src/db/cache.ts](../src/db/cache.ts)) wraps Prisma operations against the `WebscrapeCache` table. Each cache entry has:

| Field | Type | Description |
|---|---|---|
| `cacheName` | `String` | Unique key identifying the cached resource |
| `cacheTime` | `BigInt` | Unix ms timestamp of when data was last fetched |
| `expiry` | `BigInt` | Unix ms timestamp after which data is considered stale |
| `data` | `Json` | The cached payload |

## Expiry

The default TTL is **3 hours** (`EXPIRATION_TIME_MS = 1000 * 60 * 60 * 3`).

On every request:
1. `inCache(key)` — checks if a row exists for the key.
2. `isExpired(key)` — checks if `Date.now() > expiry + EXPIRATION_TIME_MS`. If expired, the route re-scrapes.
3. `getCache(key)` — returns `{ cachetime, data }`.
4. `setCache(key, data)` — upserts the row, setting a new `expiry = Date.now() + 3h`.

## Cache Keys

| Key | Route |
|---|---|
| `dining_locations` | `GET /dining` |
| `dining-menu-{store}_{mealPeriod}` | `GET /dining/menu` |
| `bus_schedules` | `GET /bus`, `GET /bus/live`, `GET /bus/liveSummary` |
| `buildings` | `GET /buildings` |
| `rit_events` | `GET /events` |
| `event-info-{eventID}` | `GET /events/getinfo` |
| `club_infos` | `GET /clubs` |

## Cache Response Shape

All cached responses are returned in this envelope:

```json
{
  "cachetime": 1749556800000,
  "data": { ... }
}
```

`cachetime` is the Unix ms timestamp of when the data was last scraped. Clients can use this to display a "last updated" indicator.

## Database Schema

```prisma
model WebscrapeCache {
  id        Int    @id @default(autoincrement())
  cacheName String
  cacheTime BigInt
  expiry    BigInt @default(0)
  data      Json
}
```
