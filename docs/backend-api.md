# Backend API

This document describes the current Express backend surface in `webserver/src/routes/*`.

Base URL in local development is usually:

```text
http://localhost:3000
```

On Android emulators, the mobile app typically reaches that backend as:

```text
http://10.0.2.2:3000
```

## Response Patterns

Most scraper-backed routes return:

```ts
{
  cachetime: number;
  data: unknown;
}
```

Some live or computed routes return:

```ts
{
  data: unknown;
}
```

Error responses are not fully standardized; some routes return JSON error objects and some return plain strings.

## General

### `GET /`

Health-lite root response from [webserver/src/App.ts](/Users/phoenixxo/sse/rit-app/webserver/src/App.ts:11).

Response:

```text
Hello, World!
```

### `GET /timeSign`

Defined in [webserver/src/routes/timeSign.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/timeSign.ts:1).

Response:

```ts
{
  time: string;
}
```

### `GET /health`

Defined in [webserver/src/routes/health.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/health.ts:1).

Checks database connectivity with `SELECT 1`.

Success:

```ts
{
  status: "ok";
  uptime: number;
  timestamp: string;
}
```

Failure:

```ts
{
  status: "degraded";
}
```

## Dining

### `GET /dining`

Defined in [webserver/src/routes/dining/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/dining/route.ts:1).

Returns scraped dining locations and metadata.

Response:

```ts
{
  cachetime: number;
  data: {
    data: Array<{
      id: number;
      name: string;
      type: string;
      open: boolean;
      code: string;
      link: string;
      image: string;
      bannerImage: string;
      busyLevel: number | null;
      hoursOfOperations?: Record<string, string[]>;
    }>;
  };
}
```

Notes:

- `type` is currently one of the scraped dining types such as `restaurant`, `market`, `coffee`, or `grocery`.
- `hoursOfOperations` is scraped from each location detail page.

### `GET /dining/menu`

Defined in [webserver/src/routes/dining/menu.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/dining/menu.ts:1).

Query parameters:

- `store`: required dining store code
- `mealPeriod`: optional meal period key for stores that support multiple periods

Valid store codes are hard-coded in `MENU_CODES` in the route file.

Response:

```ts
{
  cachetime: number;
  data: {
    store: string;
    mealPeriod: string;
    menu: Array<{
      name: string;
      category: string;
      calories: number;
      allergens: string[];
      conditionals: string[];
    }>;
    categories: string[];
  };
}
```

Failure:

```ts
{
  error: string;
}
```

with HTTP `400` when `store` is missing or invalid.

### `GET /dining/restaurantdetail`

Defined in [webserver/src/routes/dining/restaurantdetail.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/dining/restaurantdetail.ts:1).

Query parameters:

- `restaurantCode`: required RIT dining location code

Response:

```ts
{
  cachetime: number;
  data: {
    name: string;
    visitingchefs?: Array<{
      event_id: number;
      event_name: string;
      event_type: string | null;
      date: string;
      menus: Array<{
        category: string;
        name: string;
        name_note: string;
        description: string;
      }>;
    }>;
    isFDMealPlanner?: boolean;
    moreInfoLink?: string;
    hoursOfOperations: Record<string, string[]>;
  };
}
```

Notes:

- visiting chef data is only present when the source page embeds it
- `isFDMealPlanner` is set when the detail page links to FD MealPlanner

## Bus

### `GET /bus`

Defined in [webserver/src/routes/bus/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/bus/route.ts:1).

Returns the normalized schedule data used as the basis for live bus inference.

Response:

```ts
{
  data: Array<{
    rId: string;
    routeName: string;
    timeRange: string;
    days: string;
    serviceDays: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>;
    serviceWindow: {
      startMinutes: number;
      endMinutes: number;
      crossesMidnight: boolean;
    } | null;
    stops: Array<{
      name: string;
      times: string[];
    }>;
  }>;
}
```

### `GET /bus/live`

Defined in [webserver/src/routes/bus/live.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/bus/live.ts:1).

Returns currently active routes with inferred ETA/status data.

Response:

```ts
{
  data: Array<{
    route: {
      rId: string;
      routeName: string;
      timeRange: string;
      days: string;
      serviceDays: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>;
      serviceWindow: {
        startMinutes: number;
        endMinutes: number;
        crossesMidnight: boolean;
      } | null;
      stops: Array<{
        name: string;
        times: string[];
      }>;
    };
    currentStopIndex: number;
    inferredStops: Array<{
      name: string;
      times?: string[];
      etaMinutes?: number;
      status: "PAST" | "ARRIVING" | "UPCOMING";
    }>;
  }>;
}
```

Failure:

```ts
{
  error: string;
  message: string;
}
```

with HTTP `500`.

### `GET /bus/liveSummary`

Defined in [webserver/src/routes/bus/liveSummary.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/bus/liveSummary.ts:1).

Query parameters:

- `routeId`: required route id, for example `3`

Success:

```ts
{
  data: {
    routeId: string;
    routeName: string;
    fromStop: string;
    toStop: string;
    etaMinutes: number;
    status: "PAST" | "ARRIVING" | "UPCOMING";
    lastUpdated: number;
  };
}
```

Failure cases:

- `400` when `routeId` is missing
- `404` when the route is not active or summary data is unavailable
- `500` on unexpected fetch/inference failure

## News

### `GET /news`

Defined in [webserver/src/routes/news.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/news.ts:1).

Query parameters:

- `page`: optional 0-based starting page, default `0`
- `pageCount`: optional number of pages to fetch, default `1`
- `nocache=true`: optional cache bypass used for debugging

Response:

```ts
{
  cachetime: number;
  data: Array<{
    uri: string;
    title: string;
    description: string;
    date: string;
    image: string;
  }>;
}
```

Failure:

```ts
{
  success: false;
  error: string;
  message: string;
}
```

## Events

### `GET /events`

Defined in [webserver/src/routes/events/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/events/route.ts:1).

Returns CampusGroups event objects remapped from the upstream `fields` / `pN` format.

Response:

```ts
{
  cachetime: number;
  data: Array<Record<string, unknown>>;
}
```

The exact event object keys depend on the upstream `fields` list returned by CampusGroups.

## Clubs

### `GET /clubs`

Defined in [webserver/src/routes/clubs/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/clubs/route.ts:1).

Response:

```ts
{
  cachetime: number;
  data: Array<{
    name: string;
    type: string;
    website: string;
    mission: string;
    closed: boolean;
    image: string;
    isPasswordLocked: boolean;
  }>;
}
```

## Buildings

### `GET /buildings`

Defined in [webserver/src/routes/buildings/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/buildings/route.ts:1).

Response:

```ts
{
  cachetime: number;
  data: Array<{
    buildingNumber: string;
    buildingAbbreviations: string;
    buildingName: string;
    buildingImage: string;
    floorUrls: Record<string, string>;
  }>;
}
```

Notes:

- the route currently scrapes building detail pages for images and floor links
- there is a placeholder building coordinate map in code, but it is not populated

## Reports

### `GET /report`

Defined in [webserver/src/routes/report/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/report/route.ts:2).

This is a placeholder/debug endpoint and should not be treated as a stable API contract.

### `POST /report`

Defined in [webserver/src/routes/report/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/report/route.ts:10).

Request body:

```ts
{
  report: string;
}
```

Success:

```ts
{
  message: "Report received successfully.";
}
```

Failure:

- `400` for invalid request body
- `500` if Discord webhook forwarding fails

Notes:

- the route depends on `DISCORD_WEBHOOK_FOR_APP_REPORTS`
- if that env var is empty, webhook delivery will fail at runtime

## Cache Behavior

Most scraper-backed routes use [webserver/src/db/cache.ts](/Users/phoenixxo/sse/rit-app/webserver/src/db/cache.ts:1).

Current implementation details:

- TTL is 3 hours
- cache values are stored in PostgreSQL
- many routes simply return the cache envelope from `getCache()`

## Contract Caveats

- Response envelopes are not fully standardized across all endpoints.
- Some route comments and older docs still reflect older API shapes.
- Several payloads are derived from scraped HTML and may change if upstream markup changes.
