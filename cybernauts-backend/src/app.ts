import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import graphRoutes from "./routes/graphRoutes";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", router);
app.use("/api/graph", graphRoutes);

export default app;
