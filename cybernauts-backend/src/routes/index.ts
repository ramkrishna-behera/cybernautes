import { Router, Request, Response } from "express";
import userRoutes from "./userRoutes";

const router = Router();

// Root test endpoint
router.get("/", (req: Request, res: Response) => {
  res.json({ message: "🌐 API is working fine!" });
});

router.use("/users", userRoutes);

export default router;
