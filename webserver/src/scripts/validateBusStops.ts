import {getMissingStopNames} from "../lib/bus/coordinates";
import {scrapeRouteDetails, scrapeRouteMetadata} from "../lib/bus/scraper";
import fs from "node:fs";
import path from "node:path";

async function getStopNamesFromLiveScrape(): Promise<Set<string>> {
    const metadata = await scrapeRouteMetadata();
    const stopNames = new Set<string>();

    for (const route of metadata) {
        const details = await scrapeRouteDetails(route);
        for (const stop of details.stops) {
            stopNames.add(stop.name.trim());
        }
    }

    return stopNames;
}

function getStopNamesFromSampleOutput(): Set<string> {
    const samplePath = path.resolve(__dirname, "output.json");
    if (!fs.existsSync(samplePath)) {
        throw new Error(`No fallback data found at ${samplePath}.`);
    }

    const parsed = JSON.parse(fs.readFileSync(samplePath, "utf-8"));
    const stopNames = new Set<string>();
    const routes = parsed?.data ?? [];

    for (const routeRecord of routes) {
        const stops = routeRecord?.route?.stops ?? routeRecord?.stops ?? [];
        for (const stop of stops) {
            if (typeof stop?.name === "string" && stop.name.trim()) {
                stopNames.add(stop.name.trim());
            }
        }
    }

    return stopNames;
}

async function main() {
    let stopNames: Set<string>;

    try {
        stopNames = await getStopNamesFromLiveScrape();
    } catch {
        stopNames = getStopNamesFromSampleOutput();
        console.log("Live scrape unavailable, validated against local sample data.");
    }

    const allStopNames = Array.from(stopNames).sort((a, b) => a.localeCompare(b));
    const missingStops = getMissingStopNames(allStopNames);

    if (missingStops.length > 0) {
        console.error("Missing coordinates for shuttle stops:");
        for (const stop of missingStops) {
            console.error(`- ${stop}`);
        }
        process.exit(1);
    }

    console.log(`Validated ${allStopNames.length} shuttle stops; all have coordinates.`);
}

main().catch((err) => {
    console.error("Failed to validate shuttle stop coordinates.");
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
});
