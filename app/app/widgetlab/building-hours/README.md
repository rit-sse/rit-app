Building Hours
==============

Shows open/closed status and today's hours for campus locations.

Screen
- `app/widgetlab/building-hours/index.tsx` — reachable from the grid at `/widgetlab/building-hours/`.

Data
- Featured carousel: `GET /building-hours/livetime` — the five live-tracked locations
  (Wiedman, Wallace, and the three SHED makerspaces). Each entry is
  `{ hours: { [weekday]: string }, closed: boolean }`; `closed` is derived
  server-side from the server's clock.
- All Locations list: `GET /building-hours/locations` — ~465 scraped facilities as
  `{ title, link, image }`. This endpoint carries **no schedule**, so rows show no
  hours line and no open/closed badge.

Components (`components/widgetlab/building-hours/`)
- `FeaturedLocationCard` — large card in the carousel. Props: `location: featuredLocationType`, `onPress?`.
- `LocationRow` — row in the list: image + name only. Props: `location: locationType`, `onPress?`.
  Falls back to a gray square when `location.image` is unset.
- `StatusBadge` — green "Open" / red "Closed" pill. Props: `open: boolean`. Carousel only.
- `*Skeleton` — loading placeholders for each.
- `types.ts` — `locationType` (list), `featuredLocationType` (carousel), `liveLocationType` (API).

Notes
- List rows key off `link`, not `title`: a few titles repeat across buildings
  ("Machine Shop", "Projects Lab", "Cary Graphic Arts Collection").
- Tapping a list row opens the RIT facilities page via `openLink`.
- Search filters the fetched list client-side by name. The locations endpoint also
  supports `?q=`, unused here since the full list is already in memory.

No permissions or API keys required.
