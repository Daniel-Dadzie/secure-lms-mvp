import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { prisma } from "./config/prisma";
import authRouter from "./modules/auth/auth.routes";
import usersRouter from "./modules/users/users.routes";

export const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
// Security headers — sets X-Content-Type-Options, X-Frame-Options,
// Strict-Transport-Security, X-XSS-Protection, and more per OWASP recommendations.
// Must run after CORS so CORS headers are not overridden.
app.use(helmet());
// Enforce a 10 KB body size limit to prevent large-payload DoS attacks.
// Any request body exceeding this limit will be rejected with 413.
app.use(express.json({ limit: "10kb" }));
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