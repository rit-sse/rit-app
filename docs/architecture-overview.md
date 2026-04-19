# Architecture Overview

## System Summary

The repository is a two-part system:

- `app/`: a mobile client built with Expo, React Native, Expo Router, and a mix of Tailwind-style and inline styling
- `webserver/`: an Express server that scrapes external RIT-related sources, normalizes data, and caches responses in PostgreSQL through Prisma

The app does not talk directly to RIT systems. It calls the local backend, and the backend performs scraping, normalization, and caching.

## High-Level Request Flow

1. A mobile screen calls `buildApiUrl(...)` from [app/lib/api.ts](/Users/phoenixxo/sse/rit-app/app/lib/api.ts:1).
2. The request goes to the Express backend in `webserver/`.
3. The backend route checks the PostgreSQL-backed cache through [webserver/src/db/cache.ts](/Users/phoenixxo/sse/rit-app/webserver/src/db/cache.ts:1).
4. If cached data is missing or stale, the route scrapes or fetches upstream data.
5. The backend stores the normalized payload in the `WebscrapeCache` table.
6. The backend returns a response envelope shaped like:

```ts
{
  cachetime?: number;
  data: unknown;
}
```

Some routes return plain `{ data: ... }` without the cache envelope when they derive live data from cached schedules.

## Mobile App Architecture

### Routing

The mobile app uses Expo Router with screens in `app/app/*`.

Core screens currently in active use:

- Home: [app/app/index.tsx](/Users/phoenixxo/sse/rit-app/app/app/index.tsx:29)
- Map / bus: [app/app/map.tsx](/Users/phoenixxo/sse/rit-app/app/app/map.tsx:90)
- Quick Grid: [app/app/grid.tsx](/Users/phoenixxo/sse/rit-app/app/app/grid.tsx:21)
- Calendar / events: [app/app/calendar.tsx](/Users/phoenixxo/sse/rit-app/app/app/calendar.tsx:8)
- Profile: [app/app/profile.tsx](/Users/phoenixxo/sse/rit-app/app/app/profile.tsx:110)
- Dining flow:
  - search: [app/app/dining/search.tsx](/Users/phoenixxo/sse/rit-app/app/app/dining/search.tsx:10)
  - restaurant detail: [app/app/dining/restaurant.tsx](/Users/phoenixxo/sse/rit-app/app/app/dining/restaurant.tsx:20)
  - menu: [app/app/dining/menu.tsx](/Users/phoenixxo/sse/rit-app/app/app/dining/menu.tsx:75)
- Widget Lab club search: [app/app/widgetlab/clubsearch/index.tsx](/Users/phoenixxo/sse/rit-app/app/app/widgetlab/clubsearch/index.tsx:20)
- Report form: [app/app/profile/report.tsx](/Users/phoenixxo/sse/rit-app/app/app/profile/report.tsx:23)

### Navigation

- Root layout is defined in [app/app/_layout.tsx](/Users/phoenixxo/sse/rit-app/app/app/_layout.tsx:1).
- The app uses a custom bottom navigation bar instead of default Expo Router tabs.
- Some feature screens manage navigation visibility manually through `GLOBAL`.

### Client Configuration

- API base URL logic: [app/lib/api.ts](/Users/phoenixxo/sse/rit-app/app/lib/api.ts:1)
- Expo/native config: [app/app.config.ts](/Users/phoenixxo/sse/rit-app/app/app.config.ts:2)
- Mapbox is initialized on the map screen using `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`.

## Backend Architecture

### Route Loading

The backend uses a file-based route registration pattern in [webserver/src/App.ts](/Users/phoenixxo/sse/rit-app/webserver/src/App.ts:1).

Key behavior:

- files under `webserver/src/routes/*` are loaded recursively
- exported `GET`, `POST`, `PUT`, and `DELETE` handlers are registered automatically
- directory `route.ts` files map to the directory path
- top-level files like `health.ts` and `news.ts` map to `/health` and `/news`

### Cache Layer

Caching is implemented in [webserver/src/db/cache.ts](/Users/phoenixxo/sse/rit-app/webserver/src/db/cache.ts:1).

Current behavior:

- cache storage is in PostgreSQL via Prisma
- TTL is currently 3 hours
- `getCache()` returns:

```ts
{
  cachetime: number;
  data: unknown;
}
```

### Database Layer

- Prisma client setup: [webserver/src/db/client.ts](/Users/phoenixxo/sse/rit-app/webserver/src/db/client.ts:1)
- Prisma schema: [webserver/prisma/schema.prisma](/Users/phoenixxo/sse/rit-app/webserver/prisma/schema.prisma:1)

The main active model is `WebscrapeCache`. The `news` model exists in schema but is not used by the route handlers currently checked in.

## Feature Areas

### Dining

Backend:

- locations list: [webserver/src/routes/dining/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/dining/route.ts:1)
- menu lookup: [webserver/src/routes/dining/menu.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/dining/menu.ts:1)
- restaurant detail: [webserver/src/routes/dining/restaurantdetail.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/dining/restaurantdetail.ts:1)

Mobile:

- search, detail, and menu screens under `app/app/dining/*`

Upstream sources:

- `rit.edu/dining/locations`
- `rit.edu/dining/location/...`
- FD MealPlanner API

### Bus / Map

Backend:

- schedules: [webserver/src/routes/bus/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/bus/route.ts:1)
- inferred live routes: [webserver/src/routes/bus/live.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/bus/live.ts:1)
- per-route live summary: [webserver/src/routes/bus/liveSummary.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/bus/liveSummary.ts:1)

Supporting logic:

- scraping: [webserver/src/lib/bus/scraper.ts](/Users/phoenixxo/sse/rit-app/webserver/src/lib/bus/scraper.ts:1)
- live data orchestration: [webserver/src/lib/bus/liveData.ts](/Users/phoenixxo/sse/rit-app/webserver/src/lib/bus/liveData.ts:1)
- inference: `webserver/src/lib/bus/inference.ts`
- shared types: `webserver/src/types/bus.ts` and `app/types/bus.ts`

Mobile:

- [app/app/map.tsx](/Users/phoenixxo/sse/rit-app/app/app/map.tsx:90)

Current state:

- Mapbox renders the map
- live bus routes are shown in a bottom sheet
- building interaction is not implemented yet even though a building button exists

### News

- backend route: [webserver/src/routes/news.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/news.ts:1)
- mobile consumer: [app/app/index.tsx](/Users/phoenixxo/sse/rit-app/app/app/index.tsx:64)

### Events

- backend route: [webserver/src/routes/events/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/events/route.ts:1)
- mobile consumer: [app/app/calendar.tsx](/Users/phoenixxo/sse/rit-app/app/app/calendar.tsx:11)

### Clubs

- backend route: [webserver/src/routes/clubs/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/clubs/route.ts:1)
- mobile consumer: [app/app/widgetlab/clubsearch/index.tsx](/Users/phoenixxo/sse/rit-app/app/app/widgetlab/clubsearch/index.tsx:32)

### Reports

- mobile form: [app/app/profile/report.tsx](/Users/phoenixxo/sse/rit-app/app/app/profile/report.tsx:31)
- backend route: [webserver/src/routes/report/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/report/route.ts:2)

This is currently a webhook-forwarding flow to Discord, not a ticketing system or database-backed issue store.

## External Dependencies

Primary upstream data sources:

- `rit.edu` pages for dining, news, shuttles, and buildings
- CampusGroups for clubs and events
- FD MealPlanner for menu data
- Discord webhook for report delivery
- Mapbox for map rendering in the mobile app

## Known Architectural Risks

- Many features depend on scraping HTML that the project does not control.
- Route response shapes are not fully standardized across all endpoints.
- Some docs and code comments still reflect older assumptions, especially around cache TTL and endpoint inventory.
- The repo contains a few future-facing or parked configs that are not yet backed by active code paths.
