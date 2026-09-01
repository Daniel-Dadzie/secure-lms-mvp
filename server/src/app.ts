import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { prisma } from "./config/prisma";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../docs/swagger.json";

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
import instructorRoutes from './modules/instructors/instructors.routes';
import instructorAnalyticsRouter from "./modules/instructor-analytics/instructor-analytics.routes";
import instructorPortalRouter from "./modules/instructor-portal/instructor-portal.routes";
import searchRouter from "./modules/search/search.routes";
import notificationsRouter from "./modules/notifications/notifications.routes";
import studentRoutes from "./modules/students/student.routes";
import uploadRouter from "./modules/uploads/upload.router"; // or check your relative path to the upload router file
import helpRouter from "./modules/help/help.routes";

export const app = express();

app.set("trust proxy", 1);

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
app.use("/api/enrollments", enrolmentsRouter);
app.use("/api/progress", progressRouter);
app.use("/api/support", supportRouter);
app.use("/api/help", helpRouter);
app.use("/api/admin", adminRouter);
app.use('/api/instructors', instructorRoutes);
app.use("/api/instructor/analytics", instructorAnalyticsRouter);
app.use("/api/instructor", instructorPortalRouter);
app.use("/api/search", searchRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/student", studentRoutes);
app.use("/api/uploads", uploadRouter);

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


app.get("/api", (_req, res) => {
  res.status(200).json({
    name: "Secure LMS API",
    status: "online",
    documentation: "/api/docs",
    health: "/api/health"
  });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));