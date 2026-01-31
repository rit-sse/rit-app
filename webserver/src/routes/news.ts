import { Request, Response } from 'express';
import * as cheerio from 'cheerio';
import { ScrapeCache } from '../db/cache';

interface NewsArticle {
  uri: string;
  title: string;
  description: string;
  date: string;
}

const scrapeCache = new ScrapeCache();

/**
 * Scrapes news articles from RIT's news stories page
 * @param page - Page number (0-based)
 * @returns Array of news articles sorted by newest to oldest
 */
async function scrapeRITNews(page: number = 0): Promise<NewsArticle[]> {
  const baseUrl = 'https://www.rit.edu/news/news-stories';
  const url = page > 0 ? `${baseUrl}?page=${page}` : baseUrl;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const articles: NewsArticle[] = [];

    // Select all news article items
    $('ul li').each((_, element) => {
      const $element = $(element);
      
      // Find the link and image elements
      const $link = $element.find('a').first();
      const $img = $element.find('img').first();
      
      if ($link.length > 0) {
        const href = $link.attr('href');
        const title = $link.text().trim();
        
        // Get the description from the image alt text
        const description = $img.attr('alt') || '';
        
        // Extract the date (appears before the title in the list)
        const dateText = $element.contents().first().text().trim();
        
        // Only add if we have valid data
        if (href && title && dateText) {
          articles.push({
            uri: href.startsWith('http') ? href : `https://www.rit.edu${href}`,
            title: title,
            description: description,
            date: dateText
          });
        }
      }
    });

    return articles;
    
  } catch (error) {
    console.error('Error scraping RIT news:', error);
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
    const cacheKey = `news_page${page}_count${pageCount}`;

    // Check if cache exists and is not expired
    if (await scrapeCache.inCache(cacheKey) && !(await scrapeCache.isExpired(cacheKey))) {
      res.send(await scrapeCache.getCache(cacheKey));
      return;
    }

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
    res.send({
      data: allArticles
    });
    
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news articles',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}