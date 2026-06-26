import { defineConfig, env } from "prisma/config";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local if present
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
