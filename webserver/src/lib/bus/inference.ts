/**
 *
 */
import {InferredSchedule, InferredStop, RouteSchedule, Stop} from "../../types/bus";

/**
 * Parses a time string in the format "hh:mm am/pm" and returns a `Date` object set to today's date with the specified time.
 *
 * @param {string} timeStr The time string to parse, formatted as "hh:mm am/pm".
 * @return {Date} A `Date` object representing today's date with the parsed time.
 * @throws {Error} If the provided time string is not in a valid format.
 */
function parseTimeToday(timeStr: string): Date {
    const now = new Date();
    const match = new RegExp(/(\d{1,2}):(\d{2})\s*(am|pm)/i).exec(timeStr);

    if (!match) {
        throw new Error(`Invalid time format: ${timeStr}`);
    }

    let [, hourStr, minuteStr, period] = match;
    let hour = Number.parseInt(hourStr);
    const minute = Number.parseInt(minuteStr);
    if (period.toLowerCase() === 'pm' && hour !== 12) {
        hour += 12;
    } else if (period.toLowerCase() === 'am' && hour ===12) {
        hour = 0;
    }

    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
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

    // First, find which scheduled run is currently active
    let activeTimeIndex = -1;
    const firstStop = route.stops[0];
    for (let i = 0; i < firstStop.times.length; i++) {
        const startTime = parseTimeToday(firstStop.times[i]);
        const timeDiff = startTime.getTime() - currentTime.getTime();

        // Find the next upcoming stop or recently started run
        if (timeDiff > -10 * 60 * 1000 && timeDiff <= 30 * 60 * 1000) {
            activeTimeIndex = i;
            break;
        }
    }

    // No active bus run found
    if (activeTimeIndex === -1) {
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
