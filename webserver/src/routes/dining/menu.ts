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
    // https://apiservicelocatorstenantrit.fdmealplanner.com/api/v1/data-locator-webapi/20/meals?menuId=0&accountId=4&locationId=14&mealPeriodId=2&tenantId=20&monthId=3&startDate=4%2F1%2F2026&endDate=4%2F30%2F2026&timeOffset=300
    // https://apiservicelocatorstenantrit.fdmealplanner.com/api/v1/data-locator-webapi/20/meals?menuId=0&accountId=4&locationId=14&mealPeriodId=2&tenantId=20&monthId=04&startDate=2026%2F04%2F01&endDate=2026%2F04%2F30&timeOffset=300
    const baseUrl = "https://apiservicelocatorstenantrit.fdmealplanner.com/api/v1/data-locator-webapi/20/meals";
    let todaysDate = new Date();
    const params = new URLSearchParams({
        menuId: "0",
        accountId: MENU_CODES[store].accountId.toString(),
        locationId: MENU_CODES[store].locationId.toString(),
        mealPeriodId: mealPeriodId.toString(),
        tenantId: "20",
        monthId: (todaysDate.getMonth() + 1).toString().padStart(2, "0"),
        startDate: new Date(todaysDate.getFullYear(), todaysDate.getMonth(), 1).toLocaleDateString("en-US"),
        endDate: new Date(todaysDate.getFullYear(), todaysDate.getMonth() + 1, 0).toLocaleDateString("en-US"),
        timeOffset: "300"
    });

    const url = `${baseUrl}?${params.toString()}`;
    console.log(url)
    return url;
}

const MENU_DEBUG = false;

export async function GET(req: Request, res: Response) {
    console.log("Received menu request with query:", req.query);
    if (req.query["store"] && VALIDSTORES.includes(req.query["store"].toString())) {
        console.log("Processing menu request for store:", req.query["store"].toString(), "and meal period:", req.query["mealPeriod"]?.toString() || "default");
        let inCache = await scrapeCache.inCache(`dining-menu-${req.query["store"].toString()}_${req.query["mealPeriod"]?.toString() || "default"}`);
        let isExpired = await scrapeCache.isExpired(`dining-menu-${req.query["store"].toString()}_${req.query["mealPeriod"]?.toString() || "default"}`);
        if ((inCache && !isExpired) || MENU_DEBUG) {
            console.log("Serving menu data from cache for store:", req.query["store"].toString(), "and meal period:", req.query["mealPeriod"]?.toString() || "default");
            res.send(await scrapeCache.getCache(`dining-menu-${req.query["store"].toString()}_${req.query["mealPeriod"]?.toString() || "default"}`));
            return;
        }

        let data = await fetch(createMenuAPIURL(req.query["store"].toString(), MENU_CODES[req.query["store"].toString()].mealPeriodIds[req.query["mealPeriod"]?.toString() || "default"]))
        let menuData = (await data.json())["result"][0]["allMenuRecipes"];
        console.log(data)

        let formattedMenu: any[] = [];
        let categories: string[] = [];

        for (let item of menuData) {
            formattedMenu.push({
                name: item["englishAlternateName"],
                category: item["category"],
                calories: item["calories"],
                allergens: item["allergenName"].split(","),
            });
            if (!categories.includes(item["category"])) {
                categories.push(item["category"]);
                console.log("Found new category:", item["category"]);
            }
        }

        await scrapeCache.setCache(`dining-menu-${req.query["store"].toString()}_${req.query["mealPeriod"]?.toString() || "default"}`, {
            store: req.query["store"].toString(),
            mealPeriod: req.query["mealPeriod"]?.toString() || "default",
            menu: formattedMenu,
            categories: categories
        });
        res.status(200).send(await scrapeCache.getCache(`dining-menu-${req.query["store"].toString()}_${req.query["mealPeriod"]?.toString() || "default"}`));
        return;
    }
    res.status(400).send({ "error": "Invalid or missing 'store' query parameter." });
};