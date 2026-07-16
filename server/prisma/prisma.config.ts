import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "./schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});