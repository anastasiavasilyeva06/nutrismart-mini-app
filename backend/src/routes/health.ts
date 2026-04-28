import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/version", (_req, res) => {
  res.json({ version: "1.0.0" });
});

