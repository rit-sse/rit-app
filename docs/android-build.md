# Android Build Setup

This project uses Expo with the native Android project checked into `app/android`. The fastest path to a working local Android build is:

1. Start the backend in `webserver/`.
2. Install the app dependencies in `app/`.
3. Make sure Android Studio and an emulator are available.
4. Run the Expo Android build command from `app/`.

## Prerequisites

- Node.js and npm
- Android Studio with:
  - Android SDK
  - Android SDK Platform-Tools
  - an Android emulator
- Java 17 or a version compatible with the Android Gradle setup in `app/android` (preferrably Java 21 zulu)

## Environment Variables

Create or update `app/.env` with the values you need locally:

```bash
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your-public-mapbox-token
RNMAPBOX_MAPS_DOWNLOAD_TOKEN=your-mapbox-download-token
```

Notes:

- `EXPO_PUBLIC_API_BASE_URL` should point to the backend the Android emulator can reach.
- If you run the backend on the same machine as the emulator, use `http://10.0.2.2:3000`.
- `app/lib/api.ts` already defaults Android traffic to `http://10.0.2.2:3000`, but setting it explicitly in `.env` keeps local behavior clear.
- The map screen reads `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`.
- `@rnmapbox/maps` also uses `RNMAPBOX_MAPS_DOWNLOAD_TOKEN` during native dependency setup.

## Start the Backend

From the repository root:

```bash
cd webserver
npm install
npx prisma generate
npm run build
npm start
```

The app expects the backend on port `3000` unless you override the API base URL.

## Start the Android App

In a separate terminal:

```bash
cd app
npm install
npm run android
```

`npm run android` maps to `expo run:android`, which builds and installs the native Android app from the checked-in `app/android` project.

## Emulator Checklist

Before running the build:

- Start an Android emulator from Android Studio Device Manager.
- Confirm `adb devices` shows an emulator.
- If no emulator is running, `expo run:android` may fail or wait for a target device.

## Common Problems

### Backend requests fail inside the emulator

Cause: `localhost` inside Android points to the emulator, not your host machine.

Fix: use `http://10.0.2.2:3000` for `EXPO_PUBLIC_API_BASE_URL`.

### Mapbox native setup fails

Cause: missing or invalid Mapbox tokens.

Fix: confirm both of these are present in `app/.env`:

- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`

### Gradle or SDK errors

Cause: Android SDK, Java, or local Android tooling is missing or mismatched.

Fixes:

- Open Android Studio once and let it finish SDK setup.
- Confirm an emulator image is installed.
- Confirm the Android SDK license prompts have been accepted in Android Studio.
- Retry from `app/` with `npm run android`.

### Native build looks stale after config changes

If environment or native dependency changes are not picked up, rebuild from `app/`:

```bash
npm run android
```

If that still does not refresh the build, clean from `app/android` and rebuild:

```bash
./gradlew clean
```

Then rerun:

```bash
cd ..
npm run android
```

## Quick Start

From two terminals:

Terminal 1:

```bash
cd webserver
npm install
npm start
```

Terminal 2:

```bash
cd app
npm install
npm run android
```
