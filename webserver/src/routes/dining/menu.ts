import { Request, Response } from "express";
import { ScrapeCache } from "../../db/cache";

// Preset Menu codes that correspond to MealPlanner IDs
const MENU_CODES: Record<string, { accountId: number; locationId: number; mealPeriodIds: { [key: string]: number } }> = {
    "ctrl-alt-deli": {
        "accountId": 6,
        "locationId": 6,
        "mealPeriodIds": {
            "default": 8
        }
    },
    "beanz": {
        "accountId": 2,
        "locationId": 2,
        "mealPeriodIds": {
            "default": 8
        }
    },
    "artesano-bakery-cafe": {
        "accountId": 1,
        "locationId": 1,
        "mealPeriodIds": {
            "default": 8
        }
    },
    "cafe-and-market-crossroads": {
        "accountId": 7,
        "locationId": 7,
        "mealPeriodIds": {
            "default": 2
        }
    },
    "cantina-and-grille-global-village": {
        "accountId": 8,
        "locationId": 8,
        "mealPeriodIds": {
            "default": 8
        }
    },
    "gracies": {
        "accountId": 10,
        "locationId": 10,
        "mealPeriodIds": {
            "breakfast": 1,
            "lunch": 2,
            "dinner": 3,
            "late-night": 6,
            "default": 2
        }
    },
    "kitchen-brick-city": {
        "accountId": 4,
        "locationId": 4,
        "mealPeriodIds": {
            "breakfast": 1,
            "lunch": 2,
            "default": 2
        }
    },
    "loaded-latke": {
        "accountId": 11,
        "locationId": 11,
        "mealPeriodIds": {
            "default": 8
        }
    },
    "midnight-oil": {
        "accountId": 12,
        "locationId": 12,
        "mealPeriodIds": {
            "default": 8
        }
    },
    "ritz": {
        "accountId": 4,
        "locationId": 14,
        "mealPeriodIds": {
            "breakfast": 1,
            "lunch": 2,
            "dinner": 3,
            "default": 2
        }
    },
    "college-grind": {
        "accountId": 17,
        "locationId": 18,
        "mealPeriodIds": {
            "default": 8
        }
    },
    "commons": {
        "accountId": 14,
        "locationId": 15,
        "mealPeriodIds": {
            "dinner": 3,
            "default": 3
        }
    }
};

const VALIDSTORES = Object.keys(MENU_CODES);
const scrapeCache = new ScrapeCache();

function createMenuAPIURL(store: string, mealPeriodId: number): string {
    const baseUrl = "https://apiservicelocatorstenantrit.fdmealplanner.com/api/v1/data-locator-webapi/20/meals";
    const params = new URLSearchParams({
        menuId: "0",
        accountId: MENU_CODES[store].accountId.toString(),
        locationId: MENU_CODES[store].locationId.toString(),
        mealPeriodId: mealPeriodId.toString(),
        tenantId: "20",
        monthId: "01",
        startDate: "01/01/2026",
        endDate: "01/31/2026",
        timeOffset: "300"
    });

    const url = `${baseUrl}?${params.toString()}`;
    return url;
}

export async function GET(req: Request, res: Response) {
    if (req.query["store"] && VALIDSTORES.includes(req.query["store"].toString())) {
        let inCache = await scrapeCache.inCache(`dining-menu-${req.query["store"].toString()}_${req.query["mealPeriod"]?.toString() || "default"}`);
        let isExpired = await scrapeCache.isExpired(`dining-menu-${req.query["store"].toString()}_${req.query["mealPeriod"]?.toString() || "default"}`);
        if (inCache && !isExpired) {
            res.send(await scrapeCache.getCache(`dining-menu-${req.query["store"].toString()}_${req.query["mealPeriod"]?.toString() || "default"}`));
            return;
        }

        let data = await fetch(createMenuAPIURL(req.query["store"].toString(), MENU_CODES[req.query["store"].toString()].mealPeriodIds[req.query["mealPeriod"]?.toString() || "default"]))
        let menuData = (await data.json())["result"][0]["allMenuRecipes"];

        let formattedMenu: any[] = [];

        for (let item of menuData) {
            formattedMenu.push({
                name: item["englishAlternateName"],
                category: item["category"],
                calories: item["calories"],
                allergens: item["allergenName"].split(","),
            });
        }

        await scrapeCache.setCache(`dining-menu-${req.query["store"].toString()}_${req.query["mealPeriod"]?.toString() || "default"}`, {
            store: req.query["store"].toString(),
            mealPeriod: req.query["mealPeriod"]?.toString() || "default",
            menu: formattedMenu
        });
        res.status(200).json({
            cacheTime: Date.now(),
            data: {
                store: req.query["store"].toString(),
                mealPeriod: req.query["mealPeriod"]?.toString() || "default",
                menu: formattedMenu
            }
        });
        return;
    }
    res.status(400).send({ "error": "Invalid or missing 'store' query parameter." });
};