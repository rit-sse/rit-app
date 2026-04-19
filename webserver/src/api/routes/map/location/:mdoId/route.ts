import { Request, Response } from "express";
import { getLocationGeometryByMdoId } from "../../../../../lib/map/mapper";

export async function GET(req: Request, res: Response): Promise<void> {
  const rawMdoId = req.params["mdoId"];
  const mdoId = parseInt(
    Array.isArray(rawMdoId) ? rawMdoId[0] : rawMdoId,
    10,
  );

  if (isNaN(mdoId)) {
    res.status(400).json({ error: "Invalid mdoId parameter" });
    return;
  }

  try {
    const location = await getLocationGeometryByMdoId(mdoId);
    res.header("Content-Type", "application/json").json(location);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch location geometry",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
