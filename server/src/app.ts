import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { prisma } from "./config/prisma";

// Routers
import authRouter from "./modules/auth/auth.routes";
import usersRouter from "./modules/users/users.routes";
import coursesRouter from "./modules/courses/courses.routes";
import categoriesRouter from "./modules/categories/categories.routes";
import cartRouter from "./modules/cart/cart.routes";
import paymentsRouter from "./modules/payments/payments.routes";
import enrolmentsRouter from "./modules/enrolments/enrolments.routes";
import progressRouter from "./modules/progress/progress.routes";
import supportRouter from "./modules/support/support.routes";
import adminRouter from "./modules/admin/admin.routes";
import quizzesRouter from "./modules/quizzes/quizzes.routes";
import instructorAnalyticsRouter from "./modules/instructor-analytics/instructor-analytics.routes";
import notificationsRouter from "./modules/notifications/notifications.routes";

export const app = express();

// ----------------------------------------------------------------------------
// Security middleware — must be first
// ----------------------------------------------------------------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(
  express.json({
    limit: "10kb",
    verify: (req: any, _res, buf) => {
      // Preserve the raw body for webhook signature verification —
      // express.json() would otherwise only leave us the parsed object,
      // and Paystack's HMAC is computed over the exact original bytes.
      req.rawBody = buf;
    },
  })
);


app.use(cookieParser());

// ----------------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------------
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/enrolments", enrolmentsRouter);
app.use("/api/progress", progressRouter);
app.use("/api/support", supportRouter);
app.use("/api/admin", adminRouter);
app.use("/api/instructor/analytics", instructorAnalyticsRouter);
app.use("/api/notifications", notificationsRouter);

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
// Global error handler — last middleware, never exposes stack traces to client
// ----------------------------------------------------------------------------
app.use((
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  console.error(err);
  res.status(err.status || err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
});