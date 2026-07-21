export const JWT_CONFIG = {
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  refreshExpiryMs: 7 * 24 * 60 * 60 * 1000, // 7 days in ms — used when setting cookie maxAge
} as const;