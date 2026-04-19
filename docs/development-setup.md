# Development Setup

This repository contains two apps that are usually run together:

- `app/`: Expo / React Native mobile client
- `webserver/`: Express + Prisma backend that scrapes and caches RIT data

The mobile app expects the backend to be available locally unless you point it elsewhere with environment variables.

## Repository Layout

- `app/app/*`: Expo Router screens
- `app/components/*`: reusable UI and feature components
- `app/lib/*`: client helpers such as API URL construction
- `webserver/src/routes/*`: file-based Express route handlers
- `webserver/src/lib/*`: backend feature logic, including bus scraping/inference
- `webserver/src/db/*`: Prisma client and cache layer
- `webserver/prisma/*`: Prisma schema and migrations

## Prerequisites

### General

- Node.js and npm
- Git

### Backend

- PostgreSQL reachable through `DATABASE_URL`

### Mobile

- Android Studio, Android SDK, and an emulator for Android development
- Xcode for iOS development on macOS
- Java compatible with the checked-in Android project
- Mapbox tokens for the map screen and native dependency setup

For Android-specific notes, see [android-build.md](/Users/phoenixxo/sse/rit-app/docs/android-build.md:1).

## Backend Setup

From the repo root:

```bash
cd webserver
npm install
```

Create `webserver/.env` with at least:

```bash
DATABASE_URL=postgresql://...
PORT=3000
```

Optional:

```bash
DISCORD_WEBHOOK_FOR_APP_REPORTS=https://...
```

Then build and start the server:

```bash
npm run build
npm start
```

What these commands do:

- `npm run build`: validates Prisma config, generates the Prisma client, then compiles TypeScript
- `npm start`: sources `.env`, recompiles TypeScript, then starts `dist/App.js`

If you change the Prisma schema, rerun:

```bash
npm run build
```

## Database Notes

The backend uses PostgreSQL mostly as a cache store for scraped data.

- Prisma schema: [webserver/prisma/schema.prisma](/Users/phoenixxo/sse/rit-app/webserver/prisma/schema.prisma:1)
- Cache implementation: [webserver/src/db/cache.ts](/Users/phoenixxo/sse/rit-app/webserver/src/db/cache.ts:1)
- Prisma config: [webserver/prisma.config.ts](/Users/phoenixxo/sse/rit-app/webserver/prisma.config.ts:1)

The checked-in migration history is minimal. If you are setting up a fresh local database, make sure the Prisma schema has been applied before starting the backend.

## Mobile Setup

From the repo root:

```bash
cd app
npm install
```

Create `app/.env` with:

```bash
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your-public-mapbox-token
RNMAPBOX_MAPS_DOWNLOAD_TOKEN=your-mapbox-download-token
```

Notes:

- On Android emulators, `10.0.2.2` reaches the host machine.
- If `EXPO_PUBLIC_API_BASE_URL` is omitted, the app defaults to:
  - Android: `http://10.0.2.2:3000`
  - other platforms: `http://localhost:3000`
- That behavior lives in [app/lib/api.ts](/Users/phoenixxo/sse/rit-app/app/lib/api.ts:1).

### Run the App

Android:

```bash
npm run android
```

iOS:

```bash
npm run ios
```

Expo dev server:

```bash
npm start
```

## Recommended Local Workflow

Terminal 1:

```bash
cd webserver
npm start
```

Terminal 2:

```bash
cd app
npm run android
```

## Smoke Check

After both apps are running:

1. Open the mobile app home screen and confirm news loads.
2. Open Calendar and confirm events load.
3. Open Dining and confirm restaurant cards load.
4. Open Map and confirm the map renders and bus data loads.
5. Open Group Search and confirm club data loads.
6. Submit a report only if `DISCORD_WEBHOOK_FOR_APP_REPORTS` is configured.

## Common Failure Modes

### Mobile app cannot reach backend

Check:

- backend is running on the expected port
- `EXPO_PUBLIC_API_BASE_URL` points to the right host
- Android emulator uses `10.0.2.2`, not `localhost`

### Backend starts but routes fail

Check:

- `DATABASE_URL` is valid
- Prisma client generation succeeded during `npm run build`
- the database schema exists

### Map screen fails

Check:

- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` is set
- `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` was available when native dependencies were installed

### Report submission fails

Check:

- `DISCORD_WEBHOOK_FOR_APP_REPORTS` is set in `webserver/.env`
- the backend was restarted after changing `.env`

## Current Gaps To Be Aware Of

- The repo includes some parked or future env vars in `webserver/.env` that are not currently referenced by the checked-in server routes.
- The backend is scraper-heavy, so failures in upstream RIT or CampusGroups markup can break features without any local code changes.
- There is no standardized automated test workflow checked into the repo yet; current validation is mostly manual smoke testing.
