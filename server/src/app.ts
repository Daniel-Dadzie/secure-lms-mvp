import express from "express";
import cors from "cors";
import { prisma } from "./config/prisma";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    // Confirms the API process is up AND can actually reach Postgres —
    // a "the server started" check alone wouldn't catch a DB connection failure.
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "unreachable",
    });
  }
});