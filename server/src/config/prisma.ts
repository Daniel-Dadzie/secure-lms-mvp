import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

// Create a pg connection pool
const pool = new Pool({ connectionString });

// Pass the pool to the Prisma adapter
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });