## Courses Endpoints

### `GET /courses/search`

Returns the full RIT course catalog. Results are served from a cache that refreshes every 4 days.

Accepts an optional `?q=` query parameter to filter the cached results by course code prefix (e.g. `?q=CSCI`). This filter runs against the in-memory cache — no external request is made.

### `GET /courses/advancedsearch`

Performs a filtered course search against the RIT academic catalog API. At least one query parameter is required.

| Parameter | Description | Accepted values |
|---|---|---|
| `college` | Filter by college or division | College codes (e.g. `GCCIS`, `SCB`) |
| `subject` | Filter by subject prefix | Subject codes (e.g. `CSCI`, `MATH`) |
| `keyword` | Free-text keyword search | Any string |
| `gradType` | Filter by degree level | `undergrad`, `grad` |
| `perspective` | Filter by General Education perspective | Perspective suffix only — `ARTISTIC`, `ETHICAL`, `GLOBAL`, `MATHEMATIC`, `NATSCI_INQ`, `SCIE_PRIN`, `SOCIAL` |
| `ged` | Filter by General Education elective | GED value |
| `typeofWritingIntensive` | Filter by writing intensive type | `writing_intensive_course_WI_GE`, `writing_intensive_course_FYW` |
| `honors` | Include only Honors courses | Any truthy value |
| `onlyNTID` | Include only NTID-instructed courses | Any truthy value |

Multiple parameters can be combined. When exactly one filter is applied, the result is cached for 4 days and served from cache on subsequent identical requests.

### `GET /courses/selectors`

Returns static lookup data for populating filter UI controls. Includes:

- `colleges` — college/division codes and display names
- `subjects` — subject prefix codes and display names
- `graduateTypes` — degree level options
- `perspectives` — General Education perspective options

> **Note:** `selectors` does not cover every parameter that `advancedsearch` accepts. Options for `ged`, `typeofWritingIntensive`, `honors`, and `onlyNTID` are not included in this endpoint.

### `GET /courses/info?code=COURSECODE`

Returns detailed information for a specific course by its code (e.g. `?code=CSCI-142`). Fetches live from the RIT academic catalog API each time.