import type { ResidenceSchedule, Route } from '../../types/bus';

export interface NormalizedRoute extends Route {
    timeRange: string;
    days: string;
}

export interface NormalizedResidenceSchedule extends ResidenceSchedule {
    routes: NormalizedRoute[];
}

export function normalizeSchedules(schedules: ResidenceSchedule[]): NormalizedResidenceSchedule[] {
    return schedules.map(schedule => ({
        ...schedule,
        routes: schedule.routes.map(normalizeRoute)
    }));
}

function normalizeRoute(route: Route): NormalizedRoute {
    return {
        ...route,
        timeRange: normalizeTimeRange(route.timeRange),
        days: normalizeDays(route.days),
    };
}

function normalizeTimeRange(timeRange: string): string {
    return timeRange
        .replace(/\s*-\s*/g, ' - ')
        .replace(/(\d+)\s*([ap]\.?m\.?)/gi, (_, num, period) => {
            const normalizedPeriod = period.toLowerCase().replace(/\./g, '');
            const paddedNum = num.length === 1 ? `${num}:00` : num;
            return `${paddedNum} ${normalizedPeriod}.`;
        })
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeDays(days: string): string {
    return days
        .replace(/\s+/g, ' ')
        .trim();
}
