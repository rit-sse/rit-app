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
```