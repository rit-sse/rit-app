import { Request, Response } from "express";
import * as fs from "fs";
import { getPrisma } from "../../db/client"
import { PrismaClient } from "@prisma/client"
import { server } from "typescript";


export async function GET(req: Request, res: Response) {
  if (req.query.new) {
    return res.status(200).sendFile("articlecreate.html", { root: "public" });
  }
  if (req.query.id) {
    const prisma: PrismaClient = getPrisma();

    const article = await prisma.featuredNews.findUnique({
      where: {
        id: parseInt(req.query.id.toString())
      }
    });
    let serverRender = fs.readFileSync("public/articleload.html", "utf-8");
    serverRender = serverRender.replaceAll("{ARTICLE_TITLE}", article?.title || "Article Not Found");
    serverRender = serverRender.replaceAll("{ARTICLE_BODY}", article?.body || "Article Not Found");
    serverRender = serverRender.replaceAll("{ARTICLE_IMAGE}", article?.image || "");
    serverRender = serverRender.replaceAll("{ARTICLE_AUTHOR}", article?.author || "Unknown");
    serverRender = serverRender.replaceAll("{ARTICLE_AUTHOR_ROLE}", article?.authorRole || "Unknown");
    serverRender = serverRender.replaceAll("{ARTICLE_DATE}", article?.articleDate || "Unknown");

    return res.status(200).send(serverRender);
  }
  res.status(200).sendFile("dashboard.html", { root: "public" });
}