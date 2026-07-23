function requireSecret(name: string): string {
  const value = process.env[name];

  if (!value || value.length < 32) {
    throw new Error(
      `${name} must be configured and contain at least 32 characters`
    );
  }

  return value;
}

export const JWT_CONFIG = {
  accessSecret: requireSecret("JWT_ACCESS_SECRET"),
  refreshSecret: requireSecret("JWT_REFRESH_SECRET"),
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  refreshExpiryMs: 7 * 24 * 60 * 60 * 1000,
  issuer: "secure-lms-api",
  audience: "secure-lms-client",
  algorithm: "HS256" as const,
} as const;
