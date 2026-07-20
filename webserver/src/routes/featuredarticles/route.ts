import { getPrisma } from "../../db/client"
import { PrismaClient } from "@prisma/client"

import { Request, Response } from "express";

export async function GET(req: Request, res: Response) {
    const prisma: PrismaClient = getPrisma();
    
    if(req.query.id) {
        let featuredArticle = await prisma.featuredNews.findFirst({
            where: {
                id: parseInt(req.query.id.toString())
            }
        })
        res.status(200).json(featuredArticle)
        return
    }

    let featuredArticles = await prisma.featuredNews.findMany({
        orderBy: {
            id: "asc",
            
        },
        select: {
            id: true,
            articleDate: true,
            title: true,
            image: true
        }

    });
    res.status(200).json(featuredArticles);
}

export async function POST(req: Request, res: Response) {
    const prisma: PrismaClient = getPrisma();
    const { title, imageurl, articledate, body, author, authorRole, secretKey } = req.body;

    if (secretKey !== process.env.FEATURED_ARTICLES_SECRET) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!title || !imageurl || !articledate || !body || !author || !authorRole) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    let newArticle = await prisma.featuredNews.create({
        data: {
            title,
            image: imageurl,
            articleDate: articledate,
            body,
            author,
            authorRole
        }
    });

    res.status(201).json(newArticle);
}

export async function PUT(req: Request, res: Response) {
    const prisma: PrismaClient = getPrisma();
    const { id, title, imageurl, articledate, body, author, authorRole, secretKey } = req.body;

    if (secretKey !== process.env.FEATURED_ARTICLES_SECRET) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!id || !title || !imageurl || !articledate || !body || !author || !authorRole) {
        console.log("Missing fields:", { id, title, imageurl, articledate, body, author, authorRole });
        return res.status(400).json({ error: "Missing required fields" });
    }

    let updatedArticle = await prisma.featuredNews.update({
        where: { id },
        data: {
            title,
            image: imageurl,
            articleDate: articledate,
            body,
            author,
            authorRole
        },
    });

    res.status(200).json(updatedArticle);
}