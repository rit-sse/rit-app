# API Reference

Base URL: `http://localhost:3000` (or configured `PORT`)

Our staging is `https://ritappdev.sse-dev.org` and our main will be `https://ritapp.sse-dev.org`

All responses are JSON. Cached responses include a `cachetime` field (Unix ms timestamp of when the data was last fetched).

---

## General

### `GET /`

Health smoke-test. Returns plain text `Hello, World!`.

---

### `GET /health`

Database connectivity check.

**Response `200`**
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2026-06-10T12:00:00.000Z"
}
```

**Response `503`** — database unreachable
```json
{ "status": "degraded" }
```

---

### `GET /timeSign`

Returns the server's current timestamp. Useful for debugging clock skew.

**Response `200`**
```json
{ "time": "2026-06-10T12:00:00.000Z" }
```

---

## Dining

### `GET /dining`

Returns all RIT dining locations scraped from `rit.edu/dining/locations`. Includes open/closed status, busy level, hours of operation, and a banner image. Cached for 3 hours.

**Response `200`**
```json
{
  "cachetime": 1749556800000,
  "data": [
    {
      "id": 0,
      "name": "Gracie's",
      "type": "restaurant",
      "open": true,
      "code": "gracies",
      "link": "https://rit.edu/dining/location/gracies",
      "image": "https://rit.edu/...",
      "bannerImage": "https://rit.edu/...",
      "busyLevel": 2,
      "hoursOfOperations": {
        "Monday": ["7:00am - 10:00pm"],
        "Tuesday": ["7:00am - 10:00pm"]
      }
    }
  ]
}
```

`busyLevel` is an integer `1`–`3` (parsed from the density image filename on the RIT site), or `null` if unavailable.

---

### `GET /dining/menu`

Returns today's menu for a specific dining location. Cached per store + meal period for 3 hours.

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `store` | string | Yes | Location code (see table below) |
| `mealPeriod` | string | No | `breakfast`, `lunch`, `dinner`, `late-night`, or `default` |

**Valid `store` codes**

| Code | Location |
|---|---|
| `artesano-bakery-cafe` | Artesano Bakery Cafe |
| `beanz` | Beanz |
| `cafe-and-market-crossroads` | Cafe & Market Crossroads |
| `cantina-and-grille-global-village` | Cantina & Grille Global Village |
| `college-grind` | College Grind |
| `commons` | Commons |
| `ctrl-alt-deli` | Ctrl Alt Deli |
| `gracies` | Gracie's |
| `kitchen-brick-city` | Kitchen @ Brick City |
| `loaded-latke` | Loaded Latke |
| `midnight-oil` | Midnight Oil |
| `ritz` | The Ritz |

Not all locations support all meal periods — unsupported combinations fall back to `default`.

**Response `200`**
```json
{
  "cachetime": 1749556800000,
  "data": {
    "store": "gracies",
    "mealPeriod": "lunch",
    "categories": ["Entrees", "Sides"],
    "menu": [
      {
        "name": "Grilled Chicken",
        "category": "Entrees",
        "calories": 320,
        "allergens": ["Soy"],
        "conditionals": ["Gluten Free"]
      }
    ]
  }
}
```

**Response `400`** — missing or invalid `store`
```json
{ "error": "Invalid or missing 'store' query parameter." }
```

---

## Bus

### `GET /bus`

Returns all RIT shuttle route schedules scraped from the RIT transportation site. Cached for 3 hours.

**Response `200`**
```json
{
  "cachetime": 1749556800000,
  "data": {
    "data": [
      {
        "rId": "3",
        "routeName": "Inn Route",
        "timeRange": "7:00 AM – 11:00 PM",
        "days": "Monday – Friday",
        "stops": [
          { "name": "Global Village", "times": ["7:00 AM", "7:30 AM"] }
        ]
      }
    ]
  }
}
```

---

### `GET /bus/live`

Returns real-time predictions for currently active routes. Infers bus position and ETA from scheduled times and current time.

**Response `200`**
```json
{
  "data": [
    {
      "route": { "rId": "3", "routeName": "Inn Route", ... },
      "currentStopIndex": 2,
      "inferredStops": [
        { "name": "Global Village", "times": ["7:00 AM"], "status": "PAST", "etaMinutes": null },
        { "name": "Crossroads", "times": ["7:15 AM"], "status": "ARRIVING", "etaMinutes": 2 },
        { "name": "Colony Manor", "times": ["7:30 AM"], "status": "UPCOMING", "etaMinutes": 17 }
      ]
    }
  ]
}
```

`status` is one of `"PAST"`, `"ARRIVING"`, or `"UPCOMING"`. `etaMinutes` is only set for non-past stops.

**Response `500`**
```json
{ "error": "Failed to fetch live bus data", "message": "..." }
```

---

### `GET /bus/liveSummary`

Returns a compact summary of a single active route — useful for quick UI widgets.

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `routeId` | string | Yes | The `rId` of the route (e.g., `"3"`) |

**Response `200`**
```json
{
  "data": {
    "routeId": "3",
    "routeName": "Inn Route",
    "fromStop": "Crossroads",
    "toStop": "Colony Manor",
    "etaMinutes": 17,
    "status": "ARRIVING",
    "lastUpdated": 1749556800000
  }
}
```

**Error responses**

| Status | Error code | Meaning |
|---|---|---|
| `400` | `MISSING_ROUTE_ID` | `routeId` query param not provided |
| `404` | `ROUTE_NOT_ACTIVE` | Route exists but no bus is running right now |
| `404` | `LIVE_SUMMARY_UNAVAILABLE` | Route active but summary could not be built |
| `500` | `LIVE_SUMMARY_FETCH_FAILED` | Unexpected server error |

---

## Events

### `GET /events`

Returns upcoming RIT campus events from CampusGroups. Fetches up to 400 events (10 pages × 40 per page). Cached for 3 hours.

**Response `200`**
```json
{
  "cachetime": 1749556800000,
  "data": {
    "events": [
      {
        "eventName": "Club Fair",
        "eventDates": "June 15, 2026 12:00 PM – 3:00 PM",
        "eventTags": ["Academic", "Social"]
      }
    ],
    "eventTags": ["Academic", "Social", "Sports"]
  }
}
```

---

### `GET /events/getinfo`

Returns detailed metadata for a single event using its CampusGroups event ID.

**Query Parameters**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `eventID` | string | Yes | CampusGroups event ID |

**Response `200`** — structured LD+JSON data from the event page, augmented with:
- `price` — ticket price if shown
- `organizer` — hosting organization name

**Response `404`**
```json
{ "error": "Event data not found" }
```

---

## Clubs

### `GET /clubs`

Returns all RIT student clubs scraped from CampusGroups. Cached for 3 hours.

**Response `200`**
```json
{
  "cachetime": 1749556800000,
  "data": [
    {
      "name": "Society of Software Engineers",
      "type": "Academic",
      "website": "https://sse.rit.edu",
      "mission": "To promote software engineering...",
      "closed": false,
      "image": "https://static-prod-us-east-1.campusgroups.com/...",
      "isPasswordLocked": false
    }
  ]
}
```

`closed` is `true` when the club has reached its membership cap. `isPasswordLocked` is `true` when joining requires a password.

---

## Buildings

### `GET /buildings`

Returns RIT campus buildings with their number, abbreviations, image, and floor map URLs. Cached for 3 hours.

**Response `200`**
```json
{
  "cachetime": 1749556800000,
  "data": [
    {
      "buildingNumber": "7",
      "buildingAbbreviations": "GOL",
      "buildingName": "Golisano College of Computing",
      "buildingImage": "https://www.rit.edu/...",
      "floorUrls": {
        "floor1": "https://www.rit.edu/...",
        "floor2": "https://www.rit.edu/..."
      }
    }
  ]
}
```

---

## Reports

### `POST /report`

Submits a user report. The report is forwarded to a Discord webhook configured via the `DISCORD_WEBHOOK_FOR_APP_REPORTS` environment variable.

**Request body**
```json
{ "report": "Description of the issue..." }
```

**Response `200`**
```json
{ "message": "Report received successfully." }
```

**Response `400`** — missing or malformed body
```plain
Invalid report format. Expected JSON with a 'report' field of type string.
```

**Response `500`** — webhook delivery failed
```json
{ "message": "Failed to send report. Please try again later." }
```
