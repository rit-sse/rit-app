# Environment Variables

This document lists environment variables currently relevant to local development in this repository.

It separates:

- active variables used by checked-in code
- parked or future-facing variables present in local `.env` files but not referenced by the current runtime code

Do not commit secret values.

## App Variables

The mobile app reads variables from `app/.env`.

### `EXPO_PUBLIC_API_BASE_URL`

Used by [app/lib/api.ts](/Users/phoenixxo/sse/rit-app/app/lib/api.ts:3).

Purpose:

- base URL for backend requests from the mobile app

Examples:

- Android emulator talking to a backend on the same machine:
  `http://10.0.2.2:3000`
- iOS simulator or local web:
  `http://localhost:3000`

If omitted, the app defaults to:

- Android: `http://10.0.2.2:3000`
- other platforms: `http://localhost:3000`

### `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`

Used by [app/app/map.tsx](/Users/phoenixxo/sse/rit-app/app/app/map.tsx:24).

Purpose:

- public Mapbox token used to initialize the map screen

If missing:

- the map feature may fail to render correctly

### `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`

Referenced by native Mapbox setup via [app/app.config.ts](/Users/phoenixxo/sse/rit-app/app/app.config.ts:33).

Purpose:

- token used during native dependency setup for `@rnmapbox/maps`

If missing:

- native installation/build steps can fail even if the app code itself compiles

## Backend Variables

The backend reads variables from `webserver/.env`.

### `DATABASE_URL`

Used by:

- [webserver/src/db/client.ts](/Users/phoenixxo/sse/rit-app/webserver/src/db/client.ts:1)
- [webserver/prisma.config.ts](/Users/phoenixxo/sse/rit-app/webserver/prisma.config.ts:1)

Purpose:

- PostgreSQL connection string for Prisma and the cache layer

If missing:

- database-backed routes will fail
- Prisma validation/generation can fail depending on command context

### `PORT`

Used by [webserver/src/App.ts](/Users/phoenixxo/sse/rit-app/webserver/src/App.ts:6).

Purpose:

- local HTTP port for the Express server

Default:

- `3000` if omitted

### `DISCORD_WEBHOOK_FOR_APP_REPORTS`

Used by [webserver/src/routes/report/route.ts](/Users/phoenixxo/sse/rit-app/webserver/src/routes/report/route.ts:4).

Purpose:

- forwards mobile issue reports to Discord

If missing:

- `POST /report` will not successfully deliver reports

## Parked Or Future-Facing Backend Variables

- `MOBILE_AUTH_ENABLE_MOCK_SSO`
- `MOBILE_REDIRECT_URI_ALLOWLIST`
- `MOBILE_AUTH_PUBLIC_BASE_URL`
- `SHIBBOLETH_LOGIN_URL`
- `SHIBBOLETH_TARGET_PARAM`
- `MOBILE_AUTH_ALLOW_CALLBACK_MOCK_USER`

Interpretation:

- they likely belong to planned or local-only auth work
- they should not be documented as active runtime requirements until the corresponding code paths are committed

## Example Local Files

### `app/.env`

```bash
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your-public-mapbox-token
RNMAPBOX_MAPS_DOWNLOAD_TOKEN=your-mapbox-download-token
```

### `webserver/.env`

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/rit_app
PORT=3000
DISCORD_WEBHOOK_FOR_APP_REPORTS=https://discord.com/api/webhooks/...
```

## Operational Notes

- Changing backend env vars usually requires restarting the backend.
- Changing app env vars may require restarting Expo and, for native Mapbox-related changes, rebuilding the native app.
- Avoid relying on implicit defaults for team onboarding; prefer setting the expected local values explicitly.
