import { Request, Response } from 'express';
import * as cheerio from 'cheerio';
import { scheduler } from '../lib/cache-scheduler/scheduler';

interface NewsArticle {
  uri: string;
  title: string;
  description: string;
  date: string;
  image: string;
}

const DEFAULT_PAGE = 0;
const DEFAULT_PAGE_COUNT = 1;
const CACHE_KEY = `news_page${DEFAULT_PAGE}_count${DEFAULT_PAGE_COUNT}`;

async function scrapeRITNews(page: number = 0): Promise<NewsArticle[]> {
    const baseUrl = 'https://www.rit.edu/news/news-stories';
    const url = page > 0 ? `${baseUrl}?page=${page}` : baseUrl;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const $ = cheerio.load(await response.text());
    const articles: NewsArticle[] = [];

    $('article.news-teaser').each((_, element) => {
        const $article = $(element);
        const date = $article.find('.card-header').text().trim();
        const href = $article.find('a.card-link').attr('href');
        const title = $article.find('.card-title').text().trim();
        const description = $article.find('.card-text p').text().trim();
        const image = $article.find('img.card-img-top').attr('src');

        if (href && title) {
            articles.push({
                uri: href.startsWith('http') ? href : `https://www.rit.edu${href}`,
                title: title.replace(/\s+/g, ' '),
                description: description || '',
                date: date || 'Date not available',
                image: "https://rit.edu" + image || ''
            });
        }
    });

    return articles;
}

async function fetchNewsPages(page: number, pageCount: number): Promise<NewsArticle[]> {
    const allArticles: NewsArticle[] = [];
    for (let i = 0; i < pageCount; i++) {
        allArticles.push(...await scrapeRITNews(page + i));
    }
    return allArticles;
}

export const CACHEJOB = {
    key: CACHE_KEY,
    intervalMs: 1000 * 60 * 60, // 1 hour
    fetcher: () => fetchNewsPages(DEFAULT_PAGE, DEFAULT_PAGE_COUNT),
};

export async function GET(req: Request, res: Response) {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const pageCount = parseInt(req.query.pageCount as string) || DEFAULT_PAGE_COUNT;
    const isDefault = page === DEFAULT_PAGE && pageCount === DEFAULT_PAGE_COUNT;

    if (isDefault) {
        const cached = scheduler.getCache(CACHE_KEY);
        if (!cached) {
            return res.status(503).json({ error: "Cache is warming up, try again shortly." });
        }
        return res.json({ cachetime: cached.cacheTime, data: cached.data });
    }

    try {
        const articles = await fetchNewsPages(page, pageCount);
        return res.json({ cachetime: Date.now(), data: articles });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch news articles',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
