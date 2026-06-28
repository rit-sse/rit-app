# AGENTS.md

Guidance for agents working in this repository.

## Overview

**tigerGO!** is a campus resources app built by the Society of Software Engineers at RIT. The repo is a monorepo split into two independent packages:

- [`app/`](app/) — the mobile/web client (Expo + React Native).
- [`webserver/`](webserver/) — the API server (Express + Prisma) that scrapes and proxies RIT data sources.

Each package has its own `package.json` and is installed/run separately. There is no root-level build.

## Mobile app (`app/`)

- **Stack:** Expo SDK 55, React Native 0.83, React 19, TypeScript, Expo Router (file-based navigation), NativeWind + Tailwind for styling, Mapbox / React Native Maps, Expo Notifications.
- **Target platforms: iOS and Android only — there is no web version.** Don't add or test web-specific code.
- **Requires a native build (not Expo Go):** Mapbox ships native code that Expo Go can't load, so use a native dev build (`expo run:ios` / `expo run:android`, or `expo prebuild` + EAS) rather than `expo start` against Expo Go.
- **Routing:** screens live in [`app/app/`](app/app/) and follow Expo Router's file-based convention (e.g. `app/app/dining/menu.tsx` → `/dining/menu`).
- **UI components:** shared primitives in [`app/components/ui/`](app/components/ui/) (shadcn-style, configured via `components.json`); feature components grouped by domain under [`app/components/`](app/components/).
- **Styling:** use Tailwind classes via NativeWind. Global styles in `app/global.css`, theme in `app/lib/theme.ts`. Config in `tailwind.config.js`.
- **Config:** app config is `app/app.config.ts` (TypeScript, not `app.json` — it was migrated to support `fetch`/env at config time).

### Commands (run from `app/`)

```bash
npm install
npm run ios      # expo run:ios — native dev build (use this)
npm run android  # expo run:android — native dev build (use this)
npm run lint     # expo lint
```

`npm start` (`expo start`) only works against Expo Go, which can't load Mapbox's native code — prefer the native build commands above.

Android build notes live in [`docs/android-build.md`](docs/android-build.md).

## API server (`webserver/`)

- **Stack:** Node.js, Express 5, TypeScript (CommonJS), Prisma 7 ORM over PostgreSQL, Cheerio for HTML scraping.
- **Entry point:** [`webserver/src/App.ts`](webserver/src/App.ts).
- **Endpoint docs:** [`webserver/DOCUMENTATION.md`](webserver/DOCUMENTATION.md). Route groups also have their own READMEs (e.g. `src/routes/courses/README.md`).

> ### ⚠️ Hard rule: no authenticated RIT access
>
> We **only** interface with public, unauthenticated RIT data sources. **Do NOT add any implementation that requires a user to log into RIT** — no per-user authenticated features, no handling of RIT credentials, no scraping/calling endpoints behind an RIT login (e.g. SIS-personalized data, anything custom to a logged-in student). We want to stay on good terms with RIT; if a feature would need authenticated access, stop and raise it rather than building it.

### File-based routing (important)

`App.ts` replicates Next.js-style file-based routing by scanning `src/routes/`:

- A file named `route.ts` maps to its **folder** path — `src/routes/dining/route.ts` → `/dining`.
- Any other `.ts` file maps to `folder/filename` — `src/routes/courses/search.ts` → `/courses/search`.
- A route module registers handlers by exporting named functions: `GET`, `POST`, `PUT`, and/or `DELETE`. Each is wired to the corresponding HTTP method automatically.
- To add an endpoint, create the file in the right folder and export the handler — no manual registration in `App.ts`.

### Caching

**Cache mostly-static data aggressively** — RIT's servers are the upstream source for nearly everything here, so we prefer serving from cache over hitting them on each request. Anything that changes infrequently (catalogs, locations, schedules) should go through one of the mechanisms below rather than a live fetch per request.

There are two caching mechanisms; pick based on the data shape (see [`src/lib/cache-scheduler/README.md`](webserver/src/lib/cache-scheduler/README.md)):

- **Cache scheduler (preferred for broad, consistent data):** export a `CACHEJOB = { key, intervalMs, fetcher }` from a route module. On startup the scheduler registers a background job that refreshes the cache on an interval; handlers read from cache and return instantly, never blocking on a scrape. Read with `scheduler.getCache(key)` / write with `scheduler.setCache(key, data)`.
- **Lazy `ScrapeCache`** ([`src/db/cache.ts`](webserver/src/db/cache.ts)) — request-triggered, fetch-on-demand. Use for combinatorial/per-resource queries that can't be pre-fetched in full (e.g. per-location dining detail). Routes are gradually migrating off this onto the scheduler.

Heuristic: if the full dataset is one (or a few) requests, schedule it; if the query space is user-driven or enumerates many resources, keep it lazy.

### Commands (run from `webserver/`)

```bash
npm install
npm run prisma:check   # prisma validate && prisma generate
npm run build          # prisma:check + tsc
npm start              # source .env && tsc && node ./dist/App.js
npm run clean          # rm -rf ./dist
```

Requires a `.env` (at minimum `PORT` and the PostgreSQL connection for Prisma). Prisma config is `webserver/prisma.config.ts`; generated client lives in `src/generated/` (do not edit by hand).

## Conventions

- TypeScript throughout, no test runner is currently configured in either package.
- Keep new server endpoints consistent with the file-based routing convention above and document them in `DOCUMENTATION.md` (or the relevant route-group README).
- Match the styling approach already in use in the file you're editing (Tailwind/NativeWind on the client).
- Branch names follow `dev/<feature>` or `enhancement/<feature>`; PRs target `main`.

## AI-generated contributions

If a pull request was partially or fully generated by an AI agent, **append a note saying so to the PR description.** This does **not** reduce the chance of the PR being approved — it simply lets reviewers know how to approach the code. Be honest about the extent (partial vs. full). Example:

> _Note: this PR was fully generated by an AI agent (Claude Code)._
