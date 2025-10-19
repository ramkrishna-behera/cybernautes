import express, { Request, Response } from "express";
import { getGraph, recomputeAllPopularityScores } from "../services/graphService";

const router = express.Router();

/**
 * @route GET /api/graph
 * @desc Get all users and their friendship connections
 * @returns nodes (users) and edges (friend links)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const graph = await getGraph();
    res.json(graph);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/graph/recompute
 * @desc Recompute popularity scores for all users
 */
router.post("/recompute", async (req: Request, res: Response) => {
  try {
    const result = await recomputeAllPopularityScores();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
