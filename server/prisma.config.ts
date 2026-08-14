import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// adjust "../.env" to wherever your real .env actually lives relative to server/
config({ path: path.resolve(__dirname, "../.env") });

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
