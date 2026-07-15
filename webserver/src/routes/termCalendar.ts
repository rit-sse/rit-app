import { Request, Response } from 'express';
import * as cheerio from 'cheerio';
import { ScrapeCache } from '../db/cache';

interface CalendarEvent {
  startDate: number; //midnight of the first day
  endDate: number;   //midnight of the last day
  eventName: string;
}

interface Term {
  term: string;
  events: CalendarEvent[];
}

type Calendar = Record<string, Term>;

const scrapeCache = new ScrapeCache();

// first 3 letters of any month
const MONTH_NUM: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

const MONTH_PATTERN =
  'Jan(?:uary|\\.)?|Feb(?:ruary|\\.)?|Mar(?:ch|\\.)?|Apr(?:il|\\.)?|May|' +
  'Jun(?:e|\\.)?|Jul(?:y|\\.)?|Aug(?:ust|\\.)?|Sep(?:t(?:ember)?|\\.)?|' +
  'Oct(?:ober|\\.)?|Nov(?:ember|\\.)?|Dec(?:ember|\\.)?';

// matches a month token, a 4-digit year, or a 1-2 digit day, scanned left to right
const DATE_TOKEN = new RegExp(`(${MONTH_PATTERN})|\\b(20\\d{2})\\b|(\\d{1,2})`, 'gi');

// carries year state down the rows of a term so undated rows / month rollovers resolve correctly
interface YearCursor {
  year: number;
  last: number;
}

/**
 * Parses a date cell into { startDate, endDate } as Unix ms timestamps.
 * The cursor carries year state: an explicit 4-digit year resets it and any
 * date that lands earlier than the previous one is treated as a dec->jan
 * rollover into the next year. RIT lists rows in chronological order which is
 * what makes that rollover rule safe.
 *
 * @returns startDate and endDate as Unix millisecond timestamps (UTCmidnight). If no date can be parsed, both are NaN.
 */
function parseDateRange(raw: string, cursor: YearCursor): { startDate: number; endDate: number } {
	const cleaned = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim(); // drop weekday "(Monday)"

	let currentMonth = -1;
	const dates: number[] = [];
	let m: RegExpExecArray | null;

	DATE_TOKEN.lastIndex = 0;
	while ((m = DATE_TOKEN.exec(cleaned)) !== null) {
		if (m[1]) {
			// month token
			currentMonth = MONTH_NUM[m[1].slice(0, 3).toLowerCase()];
		} else if (m[2]) {
			// explicit 4-digit year
			cursor.year = parseInt(m[2], 10);
		} else if (m[3] && currentMonth >= 0) {
			// day number -> midnight timestamp
			const day = parseInt(m[3], 10);
			let ts = Date.UTC(cursor.year, currentMonth, day);
			if (cursor.last && ts < cursor.last) {
				cursor.year += 1; // rolled past december into the next year
				ts = Date.UTC(cursor.year, currentMonth, day);
			}
			cursor.last = ts;
			dates.push(ts);
		}
	}

	if (dates.length === 0) {
		return { startDate: NaN, endDate: NaN };
	}
	return { startDate: Math.min(...dates), endDate: Math.max(...dates) };
}

/**
 * Turns a header like "FALL 2025 (Term ID: 2251)" into { key, term, year }.
 * Short Session tables have no term ID, so they fall back to a slug key. 
 */
function parseTermHeader(headerText: string): { key: string; term: string; year: number } {
	const idMatch = headerText.match(/Term ID:\s*(\d+)/i);
	const seasonMatch= headerText.match(/\b(Fall|Spring|Summer|Winter)\b/i);
	const yearMatch = headerText.match(/\b(20\d{2})\b/);

	const term= seasonMatch ? seasonMatch[1][0].toUpperCase() + seasonMatch[1].slice(1).toLowerCase(): headerText.trim();
	const key =idMatch ? idMatch[1]: headerText.replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase();
	const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getUTCFullYear();

	return { key, term, year };
}

/**
 * Scrapes RIT's academic calendar page
 * @returns Calendar object keyed by Term ID
 */
async function scrapeRITCalendar(): Promise<Calendar> {
	const url = 'https://www.rit.edu/calendar';

	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const html = await response.text();
		const $ = cheerio.load(html);

		const calendar: Calendar = {};

		// one <table> per term
		$('table').each((_, table) => {
			const rows = $(table).find('tr');

			// header row holds the term name + term ID
			const headerText = rows.eq(0).find('th, td').first().text().trim();
			if (!/\b(Fall|Spring|Summer|Winter)\b/i.test(headerText)) {
				return; // skip nav / other tables on the page
			}

			const { key, term, year } = parseTermHeader(headerText);
			const events: CalendarEvent[] = [];
			const cursor: YearCursor = { year, last: 0 }; // shared across this term's rows

			rows.slice(1).each((_, row) => {
				const cells = $(row).find('td');
				if (cells.length < 2) {
					return; // skips the "Back to Top" footer row
				}

				const dateText = cells.eq(0).text().trim();
				if (!dateText || /back to top/i.test(dateText)) {
					return;
				}

				const { startDate, endDate } = parseDateRange(dateText, cursor);

				// a single cell can hold multiple events separated by <br>
				const $cell = cells.eq(1).clone();
				$cell.find('br').replaceWith('\n');

				const eventName = $cell.text()
					.split(/\n+| {3,}/)
					.map(s => s
						.replace(/\s+/g, ' ')
						.replace(/\s*†\s*$/, '')
						.replace(/["“”]/g, '') // drop quotes RIT wraps around grades, "W"
						.trim())
					.filter(Boolean)
					.join(' / '); // join multiple events in one cell into a single name

				if (eventName) {
					events.push({ startDate, endDate, eventName });
				}
			});

			if (events.length > 0) {
				calendar[key] = { term, events };
			}
		});

		console.log(`Found ${Object.keys(calendar).length} terms`);
		return calendar;

	} catch (error) {
		console.error('Error scraping RIT calendar:', error);
		throw error;
	}
}

/**
 * GET /academic-calendar
 * Query params:
 *   - nocache (so I don't need to wait for it scrap the fresh data)
 *
 * @returns the academic calendar in format:
 * {
 *   cachetime: number,
 *   data: { "<TermID>": { term: string, events: CalendarEvent[] }, ... }
 * }
 */
export async function GET(req: Request, res: Response) {
	try {
		const cacheKey = 'academic_calendar';
		const bypassCache = req.query.nocache === 'true';

		// Check if cache exists and is not expired
		if (!bypassCache && await scrapeCache.inCache(cacheKey) && !(await scrapeCache.isExpired(cacheKey))) {
			console.log('Returning cached data');
			res.send(await scrapeCache.getCache(cacheKey));
			return;
		}

		console.log('Scraping fresh data...');

		// Otherwise, scrape new data
		const calendar = await scrapeRITCalendar();

		// Cache the results
		await scrapeCache.setCache(cacheKey, calendar);

		// Return newly scraped data
		res.send(await scrapeCache.getCache(cacheKey));

	} catch (error) {
		console.error('Error fetching calendar:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch academic calendar',
			message: error instanceof Error ? error.message : 'Unknown error'
		});
	}
}