import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { prisma } from "./config/prisma";
import authRouter from "./modules/auth/auth.routes";
import usersRouter from "./modules/users/users.routes";
import coursesRouter from "./modules/courses/courses.routes";

export const app = express();

// Security headers — must be first middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // crossOriginResourcePolicy relaxed slightly to allow Firebase Storage
  // assets (thumbnails) to load cross-origin in the browser.
  // All other Helmet defaults remain active:
  // - Content-Security-Policy
  // - X-Frame-Options: SAMEORIGIN
  // - X-Content-Type-Options: nosniff
  // - Strict-Transport-Security (HSTS)
  // - Referrer-Policy
}));

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

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);

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

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
});