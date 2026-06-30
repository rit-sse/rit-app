# Cache Scheduler

This module is the successor to [`src/db/cache.ts`](../../db/cache.ts). It replaces the current request-driven cache model with an auto-scheduled system that refreshes data proactively, independent of incoming user requests.

## Problem with the current system

`ScrapeCache` in `src/db/cache.ts` works on a **lazy, request-triggered** model:

1. A user request comes in.
2. The route checks `inCache()` and `isExpired()`.
3. If the cache is stale or missing, the route performs a fresh scrape — while the user waits.
4. The newly scraped data is stored, then returned.

This means **the user pays the cost of a full scrape** any time the cache is cold or expired. For slow scrapes (e.g. dining locations, which fetches a detail page per restaurant), this can be several seconds of latency.

## How the auto-scheduler works

The cache scheduler decouples cache refresh from user requests entirely:

```
┌─────────────────────────────────────────────────────────────┐
│  Scheduler (background)                                      │
│  Runs on a fixed interval per cache key                      │
│  Fetches fresh data → writes to cache                        │
└─────────────────────────────────────────────────────────────┘
            ↑ independent of user traffic

┌─────────────────────────────────────────────────────────────┐
│  Route handler (user request)                               │
│  Always reads from cache → returns immediately              │
│  Never triggers a scrape                                    │
└─────────────────────────────────────────────────────────────┘
```

On startup, the scheduler registers a job for each cache key (e.g. `dining_locations`, `rit_events`). Each job runs on its own interval, fetches fresh data, and writes it to the cache — regardless of whether any user has asked for it.

When a user request arrives, the route simply reads whatever is currently in cache and returns it instantly. No scrape, no wait.

## Stale-while-revalidate

If a background refresh is in progress when a request arrives, the route still serves the **existing (slightly stale) cached data** immediately. The refresh completes concurrently and the next request gets the fresh version. Users never block on a refresh.

```
t=0   Scheduler starts refresh for dining_locations
t=0   User request arrives → served from current cache (instant)
t=3s  Scheduler finishes refresh → cache updated
t=3s  Next user request → served from fresh cache (instant)
```

## What this improves

| | Old system | Cache scheduler |
|---|---|---|
| Cold cache latency | Full scrape time (seconds) | Instant (served from cache) |
| Expired cache latency | Full scrape time (seconds) | Instant (background refresh in progress) |
| Cache refresh trigger | User request | Scheduler (independent) |
| Concurrent requests during refresh | All wait on the scrape | All served from existing cache |

## Scope: consistent caches only

The auto-scheduler applies to caches that are **general and consistent** — data that is the same for all users and fetched from a single, predictable source (e.g. the full dining locations list, the events feed).

It is **not suited** for dynamic or combinatorial queries where the data space is too large or varied to pre-fetch in full. A good example is per-location dining detail pages: there are many locations, each requiring its own request, and proactively hitting all of them on every refresh cycle would place unnecessary strain on RIT's servers.

For those cases, **lazy fetching remains the right approach** — fetch on demand, cache the result, and serve from cache on subsequent requests. The scheduler handles the broad strokes; lazy caching handles the fine-grained queries.

A useful heuristic: if the full dataset can be fetched in one or a small fixed number of requests, schedule it. If the query space is driven by user input or enumerating many individual resources, keep it lazy.

## Relationship to `src/db/cache.ts`

The scheduler builds on top of `ScrapeCache` — it uses the same `getCache` / `setCache` / `isExpired` primitives as the storage layer. Routes that migrate to the scheduler can drop their inline `inCache` / `isExpired` / scrape logic and just call `getCache`. The scheduler handles the rest.

`ScrapeCache` itself may eventually be simplified or moved in-memory (as the `TODO` in that file notes) once all routes have migrated.

## Cache keys

Each data source has its own named cache key and refresh interval registered with the scheduler:

| Cache key | Source | Refresh interval |
|---|---|---|
| `dining_locations` | `rit.edu/dining/locations` | TBD |
| `rit_events` | campusgroups.rit.edu events API | TBD |

Add new entries here as routes migrate to the scheduler.
