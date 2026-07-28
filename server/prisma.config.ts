import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: "../.env" });

export default defineConfig({
  earlyAccess: true,
  schema: "./prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "node --import tsx ./prisma/seed.ts",
  },
});
