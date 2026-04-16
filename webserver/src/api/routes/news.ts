import { Request, Response } from "express";
import * as cheerio from "cheerio";
import { ScrapeCache } from "../../db/cache";
// import fs  from 'fs'; used this to make a html file of rit news, just for debugging stuff
// psql -U postgres -h localhost -p 5433 -d ritApp to log into sql db on the termial, JUST TO LOOK AT DATA DO NOT USE RAW SQL WE HAVE PRISMA FOR A REASON
interface NewsArticle {
  uri: string;
  title: string;
  description: string;
  date: string;
  image: string;
}

const scrapeCache = new ScrapeCache();

/**
 * Scrapes news articles from RIT's news stories page
 * @param page - Page number (0-based)
 * @returns Array of news articles sorted by newest to oldest
 */
async function scrapeRITNews(page: number = 0): Promise<NewsArticle[]> {
  const baseUrl = "https://www.rit.edu/news/news-stories";
  const url = page > 0 ? `${baseUrl}?page=${page}` : baseUrl;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const articles: NewsArticle[] = [];

    // Target the actual news articles
    $("article.news-teaser").each((_, element) => {
      const $article = $(element);

      // Get the date from card-header
      const date = $article.find(".card-header").text().trim();

      // Get the main link
      const $link = $article.find("a.card-link");
      const href = $link.attr("href");
      const title = $article.find(".card-title").text().trim();

      // Get the description from card-text
      const description = $article.find(".card-text p").text().trim();

      // Get image of the news card
      const image = $article.find("img.card-img-top").attr("src");

      // Only add if we have valid data
      if (href && title) {
        articles.push({
          uri: href.startsWith("http") ? href : `https://www.rit.edu${href}`,
          title: title.replace(/\s+/g, " "), // Clean up extra whitespace
          description: description || "",
          date: date || "Date not available",
          image: "https://rit.edu" + image || "",
        });
      }
    });

    console.log(`Found ${articles.length} articles`);
    return articles;
  } catch (error) {
    console.error("Error scraping RIT news:", error);
    throw error;
  }
}

/**
 * GET /news
 * Query params:
 *   - page: Page number (0-based, optional, default: 0)
 *   - pageCount: Number of pages to fetch (optional, default: 1)
 *
 * Returns array of news articles in format:
 * {
 *   cachetime: number,
 *   data: NewsArticle[]
 * }
 */
export async function GET(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const pageCountParam = parseInt(req.query.pageCount as string);
    const pageCount = pageCountParam && pageCountParam > 0 ? pageCountParam : 1;

    // Create cache key based on page and pageCount
    const cacheKey = `news_page${page}_count${pageCount}`; //for some reason this isn't working because of caching reasons that I dont know
    //const cacheKey = `news_v2_page${page}_count${pageCount}`;

    // TEMPORARILY DISABLE CACHE FOR DEBUGGING
    const bypassCache = req.query.nocache === "true";

    // Check if cache exists and is not expired
    if (
      !bypassCache &&
      (await scrapeCache.inCache(cacheKey)) &&
      !(await scrapeCache.isExpired(cacheKey))
    ) {
      console.log("Returning cached data");
      res.send(await scrapeCache.getCache(cacheKey));
      return;
    }

    console.log("Scraping fresh data...");

    // Otherwise, scrape new data
    let allArticles: NewsArticle[] = [];

    // Fetch multiple pages if requested
    for (let i = 0; i < pageCount; i++) {
      const articles = await scrapeRITNews(page + i);
      allArticles.push(...articles);
    }

    // Cache the results
    await scrapeCache.setCache(cacheKey, allArticles);

    // Return newly scraped data
    res.send(await scrapeCache.getCache(cacheKey));
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch news articles",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
