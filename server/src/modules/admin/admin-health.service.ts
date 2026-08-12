import { prisma } from "../../config/prisma";
import { SERVER_STARTED_AT } from "../../config/serverMeta";

export async function getPlatformHealth() {
  const dbStart = Date.now();
  let dbStatus: "connected" | "unreachable" = "connected";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "unreachable";
  }
  const dbResponseMs = Date.now() - dbStart;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    pendingPurchases,
    failedPurchases,
    completedToday,
    activeSessions,
    failedLogins24h,
    supportEvents,
    resolvedSupportEvents,
  ] = await Promise.all([
    prisma.purchase.count({ where: { status: "PENDING" } }),
    prisma.purchase.count({ where: { status: "FAILED" } }),
    prisma.purchase.count({
      where: { status: "COMPLETED", createdAt: { gte: todayStart } },
    }),
    prisma.refreshToken.count({ where: { revokedAt: null, expiresAt: { gt: new Date() } } }),
    prisma.auditEvent.count({
      where: { action: "auth.login_failed", createdAt: { gte: dayAgo } },
    }),
    prisma.auditEvent.count({
      where: { action: "support.question_asked", createdAt: { gte: dayAgo } },
    }),
    prisma.auditEvent.count({
      where: { action: "support.question_resolved", createdAt: { gte: dayAgo } },
    }),
  ]);

  const unansweredQuestions24h = Math.max(0, supportEvents - resolvedSupportEvents);

  return {
    status: dbStatus === "connected" ? "operational" : "degraded",
    database: { status: dbStatus, responseMs: dbResponseMs },
    purchases: { pending: pendingPurchases, failed: failedPurchases, completedToday },
    users: { activeSessions },
    auth: { failedLogins24h },
    support: { unansweredQuestions24h },
    uptime: { serverStartedAt: SERVER_STARTED_AT.toISOString() },
  };
}
