import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./config/prisma";
import authRouter from "./modules/auth/auth.routes";
import usersRouter from "./modules/users/users.routes";

export const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ----------------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------------
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
// ----------------------------------------------------------------------------
// Health check
// ----------------------------------------------------------------------------
app.get("/api/health", async (_req, res) => {
  try {
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

// ----------------------------------------------------------------------------
// Global error handler — must be last middleware registered.
// Returns generic messages to client, logs detail server-side only.
// Never expose stack traces to the client (security requirement).
// ----------------------------------------------------------------------------
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
});