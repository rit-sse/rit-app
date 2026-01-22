# API Documentation
Here is the documentation for the Webserver API

## General
`GET /timeSign`

Returns the server's time for debugging purposes

**No parameters**

Returns a JSON Object with a structure
```ts
{
    time: string
}
```
---
`GET /health`

Returns the PostgreSQL's health

**No parameters**

Returns a JSON Object with a structure
```ts
{
    status: "ok",
    uptime: number,
    timestamp: string,
}     
```
## Dining
`GET /dining`

Returns all dining locations. Caches into PostgreSQL, with each request initating a check on the cacheTime. If `cacheTime` > 1 hour, then the cache is refreshed.

**No parameters**

Returns a JSON Array with a structure
```ts
{
    cacheTime: number,
    data: {
        id: number,
        name: string,
        type: string,
        open: boolean,
        code: string,
        link: string,
        image: string,
        busyLevel: number | null,
        hoursOfOperations?: {[day: string]: string} | null
    }
}
```
`GET /dining/menu`

Returns the menu for a specific dining location.

**Parameters:**
- `store`: string (required) - The code of the dining location
- `mealPeriod`: string (optional) - The meal period to get the menu for (e.g., breakfast, lunch, dinner). If not provided, returns the default menu. **NOTE**: Take a look in `webserver/src/routes/dining/menu.ts` for all valid meal periods.

Returns a JSON Object with a structure
```ts
{
    cacheTime: number,
    data: {
        menu: {
            name: string,
            calories: number,
            category: string,
            allergens: string[]
        }[],
        store: string,
        mealPeriod: string
    }
}
```