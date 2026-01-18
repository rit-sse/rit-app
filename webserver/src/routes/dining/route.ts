import { Request, Response } from "express";
import * as cheerio from "cheerio";

interface RestaurantType {
    id: number,
    name: string,
    type: string,
    open: boolean,
}

export async function GET(req: Request, res: Response) {
    const scrape = await fetch("https://www.rit.edu/dining/locations");
    const html = await scrape.text();

    const $ = cheerio.load(html);
    let onId = 0;

    let restaurants: RestaurantType[] = [];
    // let restaurants: string[] = [];
    $('li[data-dining-type="restaurant"]').map((i, el) => {
        const name = $(el).find('.font-weight-bold').text()
        restaurants.push({
            id: onId++,
            name: name.trim(),
            type: "restaurant",
            open: false
        });
    })

    // let markets: string[] = []
    $('li[data-dining-type="market"]').map((i, el) => {
        const name = $(el).find('.font-weight-bold').text()
        restaurants.push({
            id: onId++,
            name: name.trim(),
            type: "market",
            open: false
        });
    })

    // let coffees: string[] = [];
    $('li[data-dining-type="coffee"]').map((i, el) => {
        const name = $(el).find('.font-weight-bold').text()
        restaurants.push({
            id: onId++,
            name: name.trim(),
            type: "coffee",
            open: false
        });
    })

    // let groceries: string[] = [];
    $('li[data-dining-type="grocery"]').map((i, el) => {
        const name = $(el).find('.font-weight-bold').text()
        restaurants.push({
            id: onId++,
            name: name.trim(),
            type: "grocery",
            open: false
        });
    })


    res.send(restaurants);
}