# Database Documentation
## Caching
The webserver uses a PostgreSQL database to cache webscraped data for any scenario. This is done to reduce the load on the target websites and to improve performance. The cacher has a expiration timer (currently set to 1 hour) after which the cache is considered stale and will be refreshed on the next request.

There are few primary methods used for caching:

`inCache(code: string): Promise<boolean>` - This method checks if a cache entry exists for the given code.

`isExpired(code: string): Promise<boolean>` - This method checks if the cache entry for the given code has expired based on the expiration timer.

`getCache(code: string): Promise<any>` - This method retrieves the cached data for the given code if it exists and is not expired.

`setCache(code: string, data: any): Promise<void>` - This method sets or updates the cache entry for the given code with the provided data and updates the cache time.

**Important Notes:**
- Every time you retrieve from cache, it will tag on a `cacheTime` field indicating when the data was cached. This is useful for clients to know how fresh the data is.
- The expiration timer can bet set through `EXPIRATION_TIME_MS`.