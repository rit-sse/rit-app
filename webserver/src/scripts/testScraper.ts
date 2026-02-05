import {scrapeSchedules} from '../lib/bus/scraper';

(async () => {
    const data = await scrapeSchedules();
    console.dir(data, { depth: null });
})();
