# Adding Routes

The server uses a file-based routing system modeled after Next.js. Adding a new route requires no registration code — just create a file.

## Route Resolution Rules

The loader in `App.ts` recursively walks `src/routes/` at startup and registers handlers based on file names and exported symbols.

| File | Registered path |
|---|---|
| `src/routes/dining/route.ts` | `/dining/` |
| `src/routes/dining/menu.ts` | `/dining/menu` |
| `src/routes/health.ts` | `/health` |
| `src/routes/bus/live.ts` | `/bus/live` |

A file named exactly `route.ts` (or `route.js` in the compiled output) maps to the **directory** path. Any other `.ts` file maps to its filename without the extension.

## Minimal Route Template

```typescript
import { Request, Response } from "express";

export async function GET(req: Request, res: Response) {
    res.status(200).json({ message: "hello" });
}

// Also supported: POST, PUT, DELETE
export async function POST(req: Request, res: Response) {
    res.status(201).json({ created: true });
}
```

Export only the HTTP methods your route needs. Unexported methods are simply not registered.

## Route With Caching

Most routes that scrape external data follow this pattern:

```typescript
import { Request, Response } from "express";
import { ScrapeCache } from "../../db/cache";

const scrapeCache = new ScrapeCache();
const CACHE_KEY = "my_data";

export async function GET(req: Request, res: Response) {
    if (await scrapeCache.inCache(CACHE_KEY) && !(await scrapeCache.isExpired(CACHE_KEY))) {
        return res.json(await scrapeCache.getCache(CACHE_KEY));
    }

    // Fetch or scrape fresh data
    const data = await fetchSomeData();

    await scrapeCache.setCache(CACHE_KEY, data);
    res.json(await scrapeCache.getCache(CACHE_KEY));
}
```

The cache TTL is 3 hours. See [caching.md](caching.md) for the full cache key inventory and schema details.

## Error Handling

Return structured error objects with an appropriate HTTP status code:

```typescript
res.status(400).json({ error: "MISSING_PARAM", message: "Query parameter 'id' is required." });
res.status(404).json({ error: "NOT_FOUND", message: "Resource not found." });
res.status(500).json({ error: "INTERNAL_ERROR", message: err instanceof Error ? err.message : String(err) });
```

## Checklist

- [ ] File placed under `src/routes/`
- [ ] Exports at least one of `GET`, `POST`, `PUT`, `DELETE`
- [ ] Route documented in [api-reference.md](api-reference.md)
- [ ] Cache key added to the cache key table in [caching.md](caching.md) if applicable
