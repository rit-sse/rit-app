# Server Structure

This is where the server and all of its endpoints are handled. It follows the similar structure to our Next.JS server, but now solely taking those concepts and making them into an Express.JS Framework.

Treat `App.ts` as the `/` route, with all other routes going into `./routes`

Any routes included in `/src` and not `/src/routes/*` will be disregarded by `App.ts` entirely.

## Route File Structure

Each route file are able to access these following methods that will be read by `App.ts`, which is `GET`, `POST`, `PUT`, and `DELETE`