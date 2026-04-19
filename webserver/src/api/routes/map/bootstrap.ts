import { Request, Response } from "express";
import { getMapBootstrapData } from "../../../lib/map/mapper";
import { MapBootstrapResponse } from "../../../types/locations";

/**
 *
 * Fetches the map bootstrap data, including searchable locations. The response includes a timestamp for when the data was fetched and an expiration time (24 hours). If there's an error during fetching, it returns a 500 status with an error message.
 *
 * @param req - The incoming request object
 * @param res - The response object used to send back the data or error message
 * @returns A promise that resolves when the response is sent
 */
export async function GET(req: Request, res: Response): Promise<void> {
  try {
    const { locations, searchRecords } = await getMapBootstrapData();

    const response: MapBootstrapResponse = {
      fetchedAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      locations,
      searchRecords,
    };

    res.header("Content-Type", "application/json").send(response);
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
