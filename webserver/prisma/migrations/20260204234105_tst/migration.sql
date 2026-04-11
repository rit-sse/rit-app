-- CreateTable
CREATE TABLE "WebscrapeCache" (
    "id" SERIAL NOT NULL,
    "cacheName" TEXT NOT NULL,
    "cacheTime" BIGINT NOT NULL,
    "expiry" BIGINT NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL,

    CONSTRAINT "WebscrapeCache_pkey" PRIMARY KEY ("id")
);
