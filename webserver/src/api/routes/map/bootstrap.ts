import { Request, Response } from "express";
import { getSearchableLocations } from "../../../lib/map/mapper";

export async function GET(req: Request, res: Response) {
  try {
    const locations = await getSearchableLocations();

    res.header("Content-Type", "application/json").send({
      fetchedAt: Date.now(),
      locations,
    });
  } catch (error) {
    res
      .status(500)
      .header("Content-Type", "application/json")
      .send({
        error: "Failed to fetch map bootstrap data",
        message: error instanceof Error ? error.message : String(error),
      });
  }
}
