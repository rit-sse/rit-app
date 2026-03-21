/**
 *
 */
import {InferredSchedule, InferredStop, RouteSchedule, ServiceDay, Stop} from "../../types/bus";

const MINUTES_PER_DAY = 24 * 60;
const RUN_COMPLETION_GRACE_MINUTES = 5;

/**
 * Parses a time string in the format "hh:mm am/pm" and returns a `Date` object set to today's date with the specified time.
 *
 * @param {string} timeStr The time string to parse, formatted as "hh:mm am/pm".
 * @return {Date} A `Date` object representing today's date with the parsed time.
 * @throws {Error} If the provided time string is not in a valid format.
 */
function parseTimeToday(timeStr: string): Date {
    const now = new Date();
    const match = new RegExp(/(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m?\.?/i).exec(timeStr);

    if (!match) {
        throw new Error(`Invalid time format: ${timeStr}`);
    }

    let [, hourStr, minuteStr = "00", period] = match;
    let hour = Number.parseInt(hourStr);
    const minute = Number.parseInt(minuteStr);
    if (period.toLowerCase() === 'p' && hour !== 12) {
        hour += 12;
    } else if (period.toLowerCase() === 'a' && hour ===12) {
        hour = 0;
    }

    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
}

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

function getMinutesNow(currentTime: Date): number {
    return currentTime.getHours() * 60 + currentTime.getMinutes();
}

function getToday(currentTime: Date): ServiceDay {
    return currentTime.getDay() as ServiceDay;
}

function getYesterday(currentTime: Date): ServiceDay {
    return ((currentTime.getDay() + 6) % 7) as ServiceDay;
}

function runsToday(route: RouteSchedule, currentTime: Date): boolean {
    const {serviceDays, serviceWindow} = route;
    const today = getToday(currentTime);

    if (!serviceWindow) {
        return false;
    }

    if (!serviceWindow.crossesMidnight) {
        return serviceDays.includes(today);
    }

    const minutesNow = getMinutesNow(currentTime);
    if (minutesNow >= serviceWindow.startMinutes) {
        return serviceDays.includes(today);
    }

    return serviceDays.includes(getYesterday(currentTime));
}

function runsInWindow(route: RouteSchedule, currentTime: Date): boolean {
    const {serviceWindow} = route;
    if (!serviceWindow) {
        return false;
    }

    const minutesNow = getMinutesNow(currentTime);
    if (!serviceWindow.crossesMidnight) {
        return (
            minutesNow >= serviceWindow.startMinutes &&
            minutesNow <= serviceWindow.endMinutes
        );
    }

    return (
        minutesNow >= serviceWindow.startMinutes ||
        minutesNow <= serviceWindow.endMinutes
    );
}

function resolveRunTimeMinutes(rawTime: string, serviceWindowCrossesMidnight: boolean): number | null {
    const minutes = parseTimeToMinutes(rawTime);
    if (minutes == null) {
        return null;
    }

    if (!serviceWindowCrossesMidnight) {
        return minutes;
    }

    return minutes < 12 * 60 ? minutes + MINUTES_PER_DAY : minutes;
}

function resolveCurrentTimeMinutes(route: RouteSchedule, currentTime: Date): number {
    const minutesNow = getMinutesNow(currentTime);
    if (route.serviceWindow?.crossesMidnight && minutesNow < 12 * 60) {
        return minutesNow + MINUTES_PER_DAY;
    }
    return minutesNow;
}

function findActiveRunIndex(route: RouteSchedule, currentTime: Date): number | null {
    const firstStop = route.stops[0];
    if (!firstStop) {
        return null;
    }

    const normalizedNow = resolveCurrentTimeMinutes(route, currentTime);
    let bestIndex: number | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let runIndex = 0; runIndex < firstStop.times.length; runIndex++) {
        const runMinutes = route.stops
            .map((stop) => stop.times[runIndex])
            .filter((time): time is string => !!time)
            .map((time) => resolveRunTimeMinutes(time, route.serviceWindow?.crossesMidnight ?? false))
            .filter((time): time is number => time != null);

        if (runMinutes.length === 0) {
            continue;
        }

        const firstRunMinute = Math.min(...runMinutes);
        const lastRunMinute = Math.max(...runMinutes) + RUN_COMPLETION_GRACE_MINUTES;

        if (normalizedNow < firstRunMinute || normalizedNow > lastRunMinute) {
            continue;
        }

        const distance = Math.abs(normalizedNow - firstRunMinute);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = runIndex;
        }
    }

    return bestIndex;
}

/**
 * Finds the index of the current stop based on the active time slot.
 * Returns the first stop that hasn't been reached yet on this run.
 *
 * @param {Stop[]} stops - An array of stop objects.
 * @param {Date} currentTime - The current time.
 * @param {number} activeTimeIndex - The index of the active scheduled run.
 * @return {number} The index of the current/next stop on this run.
 */
function findCurrentStopIndex(stops: Stop[], currentTime: Date, activeTimeIndex: number): number {
    // Find the first stop that hasn't been passed yet
    for (let i = 0; i < stops.length; i++) {
        const timeStr = stops[i].times[activeTimeIndex];
        if (!timeStr) continue;

        const stopTime = parseTimeToday(timeStr);

        // If this stop's time is in the future (or within 1 min past), this is where we are
        if (stopTime.getTime() >= currentTime.getTime() - 60 * 1000) {
            return i;
        }
    }

    // All stops have passed, return last stop
    return stops.length - 1;
}

/**
 * Calculates the estimated time of arrival (ETA) in minutes based on the difference
 * between the target time and the current time.
 *
 * @param {Date} currentTime - The current time.
 * @param {Date} targetTime - The target time to reach.
 * @return {number} The ETA in minutes. Returns 0 if the target time is in the past.
 */
function calculateETA(currentTime: Date, targetTime: Date): number {
    const diffMs = targetTime.getTime() - currentTime.getTime();
    return Math.max(0, Math.round(diffMs / 1000 / 60));
}

/**
 * Infers the schedule of a route based on the current time and available stop timings.
 *
 * @param {RouteSchedule} route - The schedule information for a specific route, including stops and timings.
 * @return {InferredSchedule | null} An inferred schedule object containing updated statuses and estimated arrival times for each stop,
 * or `null` if no active bus run is found within the valid time range.
 */
export function inferSchedule(route: RouteSchedule): InferredSchedule | null {
    const currentTime = new Date();

    if (!runsToday(route, currentTime) || !runsInWindow(route, currentTime)) {
        return null;
    }

    const activeTimeIndex = findActiveRunIndex(route, currentTime);

    if (activeTimeIndex == null) {
        return null;
    }

    // Now find which stop we're currently at on this run
    const currentStopIndex = findCurrentStopIndex(route.stops, currentTime, activeTimeIndex);

    const inferredStops: InferredStop[] = route.stops.map((stop, index) => {
        const timeStr = stop.times[activeTimeIndex];
        if (!timeStr) {
            return {
                ...stop,
                status: "UPCOMING",
            };
        }

        const stopTime = parseTimeToday(timeStr);
        const eta = calculateETA(currentTime, stopTime);

        let status: "PAST" | "ARRIVING" | "UPCOMING";
        if (index < currentStopIndex) {
            status = "PAST";
        } else if (index === currentStopIndex && eta <= 5) {
            status = "ARRIVING";
        } else {
            status = "UPCOMING";
        }

        return {
            ...stop,
            etaMinutes: eta,
            status,
        };
    });

    return {
        route,
        currentStopIndex,
        inferredStops,
    }
}

/**
 * Retrieves the next stop in the schedule along with the estimated time of arrival (ETA).
 *
 * @param {RouteSchedule} route - The schedule of the route to infer the next stop from.
 * @return {{stop: InferredStop, eta: number} | null} An object containing the next stop and its ETA in minutes, or null if the schedule cannot be inferred.
 */
export function getNextStop(route: RouteSchedule): {stop: InferredStop; eta: number} | null {
    const inferred = inferSchedule(route);

    if (!inferred) {
        return null;
    }

    const nextStop = inferred.inferredStops[inferred.currentStopIndex];

    return {
        stop: nextStop,
        eta: nextStop.etaMinutes || 0,
    };
}
