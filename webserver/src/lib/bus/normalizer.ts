import type {
  NormalizedResidenceSchedule,
  NormalizedRoute,
  ResidenceSchedule,
  Route,
} from "../../../types/bus";

/**
 * Normalizes raw scraped schedule data to ensure consistent formatting.
 *
 * Takes the raw output from scrapeSchedules() and standardizes:
 * - Time formatting (ensures consistent spacing, AM/PM notation, and padding)
 * - Whitespace normalization across all text fields
 *
 * @param schedules - Raw residence schedules from the scraper
 * @returns Normalized schedules with consistent formatting
 *
 * @example
 * const raw = await scrapeSchedules();
 * const normalized = normalizeSchedules(raw);
 * // "7 a.m.- 11:46 p.m." becomes "7:00 a.m. - 11:46 p.m."
 */
export function normalizeSchedules(
  schedules: ResidenceSchedule[],
): NormalizedResidenceSchedule[] {
  return schedules.map((schedule) => ({
    ...schedule,
    routes: schedule.routes.map(normalizeRoute),
  }));
}

/**
 * Normalizes a single route's time range and days fields
 */
function normalizeRoute(route: Route): NormalizedRoute {
  return {
    ...route,
    timeRange: normalizeTimeRange(route.timeRange),
    days: normalizeDays(route.days),
  };
}

/**
 * Normalizes time range strings to a consistent format with consistent spacing and HH:MM accross all times.
 *
 *
 * @param timeRange - Raw time range string from scraper
 * @returns Normalized time range string
 */
function normalizeTimeRange(timeRange: string): string {
  return timeRange
    .replace(/\s*-\s*/g, " - ")
    .replace(/(\d+)\s*([ap]\.?m\.?)/gi, (_, num, period) => {
      const normalizedPeriod = period.toLowerCase().replace(/\./g, "");
      const paddedNum = num.length === 1 ? `${num}:00` : num;
      return `${paddedNum} ${normalizedPeriod}.`;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes day strings by collapsing multiple spaces.
 *
 * @param days - Raw days string from scraper
 * @returns Normalized days string
 */
function normalizeDays(days: string): string {
  return days.replace(/\s+/g, " ").trim();
}
