import { Request, Response } from "express";

// Preset Menu codes that correspond to MealPlanner IDs
const MENU_CODES = {
    "ctrl-alt-deli" : 4
};

// TODO: Create a menu route
/*
    This has been total pain. FD Mealplanner's API shoves so much megabytes of data that my laptop decided to CRASH since it ran out of memory (HOW??!?!?)
    If you want to take up this task, here are a few notes to get you started:

    Here is an example API that is used to get menu information
    Ctrl-Alit-Deli API: https://apiservicelocatorstenantrit.fdmealplanner.com/api/v1/data-locator-webapi/20/meals?menuId=0&accountId=6&locationId=6&mealPeriodId=8&tenantId=20&monthId=01&startDate=01%2F01%2F2026&endDate=01%2F31%2F2026&timeOffset=300
    This API was retrieved by monitoring network activity (specifically XHR requests) through Inspect Element by going into the restaurant menu.
    The most important area you might focus on is (lets assume the response is "menudata"):
        menudata["result"][0]["allMenuRecipes"]
    This will show you all the foods on the menu, detailing their Category and nutritional information.
    All menus were retrieved via https://www.fdmealplanner.com/#menu/mp/RIT/ , which lists all accessible restaurant menus

    Why I was facing headwinds:
    - Not all restaurants have a menu on MealPlanner
    - Some restaurants dont even have a menu at all
    - Some restaurants have split sessions (Breakfast, Lunch, Dinner) which need to be accomodated (mealPeriodId)
    - Each restaurant has their own ID via accountId, locationId (which I was trying to assign through MENU_CODES)
    - Some responses were 10+ mb in size (which lead to my laptop crashing)

    If you are going to work on this, I wish you good luck (maybe FDMealplanner has updated by now which is better)
    
    (last updated: Janurary 21, 2026)
*/ 

// export function GET(req: Request, res: Response) {
//     res.send(req.query);
// };