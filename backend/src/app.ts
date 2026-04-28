import express from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";

import { errorMiddleware } from "./middleware/error";
import { healthRouter } from "./routes/health";

export const upload = multer({ storage: multer.memoryStorage() });

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "nutrismart-backend" });
  });

  app.use("/api", healthRouter);

  app.use(errorMiddleware);
  return app;
}

