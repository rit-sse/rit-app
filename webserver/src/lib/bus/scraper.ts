import * as cheerio from "cheerio";
import { CheerioAPI } from "cheerio";
import type { Route, RouteSchedule, ServiceDay, ServiceWindow, Stop } from "../../types/bus";

interface RouteMetadata extends Route {
  url: string;
}

const DAY_NAME_TO_INDEX: Record<string, ServiceDay> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function parseTimeToMinutes(rawTime: string): number | null {
  const match = /(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m?\.?/i.exec(rawTime.trim());
  if (!match) {
    return null;
  }

  const hour = Number.parseInt(match[1] ?? "0", 10);
  const minute = Number.parseInt(match[2] ?? "0", 10);
  const meridiem = (match[3] ?? "").toLowerCase();

  let normalizedHour = hour;
  if (meridiem === "p" && normalizedHour !== 12) {
    normalizedHour += 12;
  } else if (meridiem === "a" && normalizedHour === 12) {
    normalizedHour = 0;
  }

  return normalizedHour * 60 + minute;
}

function parseServiceWindow(timeRange: string): ServiceWindow | null {
  const [rawStart, rawEnd] = timeRange
    .split(/\s*-\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!rawStart || !rawEnd) {
    return null;
  }

  const startMinutes = parseTimeToMinutes(rawStart);
  const endMinutes = parseTimeToMinutes(rawEnd);

  if (startMinutes == null || endMinutes == null) {
    return null;
  }

  return {
    startMinutes,
    endMinutes,
    crossesMidnight: endMinutes < startMinutes,
  };
}

function parseServiceDays(days: string): ServiceDay[] {
  const normalizedDays = days.toLowerCase().trim();

  if (
    normalizedDays.includes("daily") ||
    normalizedDays.includes("every day") ||
    normalizedDays.includes("monday through sunday")
  ) {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  if (normalizedDays.includes("weekday")) {
    return [1, 2, 3, 4, 5];
  }

  if (normalizedDays.includes("weekend")) {
    return [0, 6];
  }

  if (normalizedDays.includes("through")) {
    const [startLabel, endLabel] = normalizedDays.split("through").map((part) => part.trim());
    const start = DAY_NAME_TO_INDEX[startLabel];
    const end = DAY_NAME_TO_INDEX[endLabel];

    if (start != null && end != null) {
      const result: ServiceDay[] = [];
      let current: ServiceDay = start;
      result.push(current);
      while (current !== end) {
        current = ((current + 1) % 7) as ServiceDay;
        result.push(current);
      }
      return result;
    }
  }

  const matchedDays = Object.entries(DAY_NAME_TO_INDEX)
    .filter(([label]) => normalizedDays.includes(label))
    .map(([, index]) => index);

  return Array.from(new Set(matchedDays)).sort((a, b) => a - b) as ServiceDay[];
}

export function enrichRouteServiceFields<T extends Pick<Route, "days" | "timeRange">>(
  route: T & Partial<Pick<Route, "serviceDays" | "serviceWindow">>,
): T & Pick<Route, "serviceDays" | "serviceWindow"> {
  return {
    ...route,
    serviceDays:
      route.serviceDays && route.serviceDays.length > 0
        ? route.serviceDays
        : parseServiceDays(route.days),
    serviceWindow: route.serviceWindow ?? parseServiceWindow(route.timeRange),
  };
}

/**
 * Scrapes route metadata from RIT's campus shuttles webpage.
 *
 * Extracts route information including URL, ID, name, operating hours, and days
 * from the main schedule table.
 *
 * @returns Promise resolving to an array of route metadata objects
 */
export async function scrapeRouteMetadata(): Promise<RouteMetadata[]> {
  const scraper: Response = await fetch(
    "https://www.rit.edu/parking/campus-shuttles",
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    },
  );

  if (!scraper.ok) {
    throw new Error(`Failed to fetch RIT's bus schedule: ${scraper.status}`);
  }
  const html: string = await scraper.text();
  const $: CheerioAPI = cheerio.load(html);

  // First, get all route links from the page, indexed by route ID
  const routeLinks = new Map<string, string>(); // Map of rId -> url
  $(".view-bus-schedules a").each((_, el) => {
    const url = $(el).attr("href");
    const text = $(el).text().trim();
    if (url?.startsWith("/parking/")) {
      // Extract route ID from text (e.g., "11 Retail Shuttle" -> "11")
      const match = text.match(/^(\d+)\s+/);
      const rId = match?.[1];
      if (rId) {
        routeLinks.set(rId, url);
      }
    }
  });

  // Now get route metadata from table
  const routesMap = new Map<string, RouteMetadata>(); // Use map to deduplicate by rId
  const table = $("table").first();

  if (!table.length) {
    return [];
  }

  // Process each row in the table.
  //
  // RIT's table layout is not stable: the "Hours of Operation" column has been
  // split across multiple <td>s (start | "-" | end) and the "Days" column has
  // shifted position. Rather than relying on fixed column indices, identify each
  // field by its content so the scraper survives future column reshuffles.
  const TIME_PATTERN = /\d{1,2}(?::\d{2})?\s*[ap]\.?\s*m/i;
  const DAY_PATTERN =
    /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|daily|weekday|weekend|break)/i;

  table.find("tbody tr").each((_, row) => {
    const cellTexts = $(row)
      .find("td")
      .toArray()
      .map((cell) => $(cell).text().trim());

    // Route text (e.g., "3 Campus Connection Shuttle") — the cell that starts
    // with a route number. This also naturally skips the header row.
    const routeText = cellTexts.find((text) => /^\d+\s+.+$/.test(text));
    if (!routeText) return;

    // Time range: reconstruct "start - end" from the time-like cells so
    // parseServiceWindow (which splits on "-") works unchanged.
    const timeCells = cellTexts.filter((text) => TIME_PATTERN.test(text));
    const timeRange =
      timeCells.length > 0
        ? `${timeCells[0]} - ${timeCells[timeCells.length - 1]}`
        : "";

    // Days: the cell that mentions a day / service keyword.
    const days = cellTexts.find((text) => DAY_PATTERN.test(text)) ?? "";

    // Extract route ID from text (e.g., "3 Campus Connection Shuttle" -> "3")
    const match = routeText.match(/^(\d+)\s+(.*)$/);
    const rId = match?.[1] ?? "";
    const routeName = match?.[2] ?? routeText;

    // Find matching URL by route ID
    const url = routeLinks.get(rId);

    if (!url) {
      console.log(`No URL found for route ID ${rId}: "${routeText}"`);
      return;
    }

    // Only add if we haven't seen this route ID before
    if (!routesMap.has(rId)) {
      routesMap.set(rId, {
        ...enrichRouteServiceFields({
          url,
          rId,
          routeName,
          timeRange,
          days,
        }),
      });
    }
  });

  return Array.from(routesMap.values());
}

/**
 * Scrapes detailed stop times for a specific route
 *
 * @param metadata - Route metadata including URL and basic info
 * @returns Promise resolving to a complete RouteSchedule with stops
 */
export async function scrapeRouteDetails(
  metadata: RouteMetadata,
): Promise<RouteSchedule> {
  const fullUrl = `https://www.rit.edu${metadata.url}`;
  const response = await fetch(fullUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch route details: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const stops: Stop[] = [];
  const table = $("table").first();

  if (!table.length) {
    return enrichRouteServiceFields({ ...metadata, stops });
  }

  // Get stop names
  const headers = table.find("thead th, tbody tr:first th");

  headers.each((_, el) => {
    const name = $(el).text().trim();
    if (name) {
      stops.push({ name, times: [] });
    }
  });

  // Get times for each stop
  table.find("tbody tr").each((_, row) => {
    const cells = $(row).find("td");

    cells.each((colIndex, cell) => {
      const time = $(cell).text().trim();
      if (time && stops[colIndex]) {
        stops[colIndex].times.push(time);
      }
    });
  });

  return enrichRouteServiceFields({ ...metadata, stops });
}
