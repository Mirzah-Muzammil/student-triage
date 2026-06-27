import dotenv from "dotenv";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const confirmed = process.argv.includes("--confirm");

if (!confirmed) {
  console.log("Refusing to clear the database without explicit confirmation.");
  console.log("Run: npm run db:clear -- --confirm");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

neonConfig.webSocketConstructor = ws;

const databaseUrl = new URL(process.env.DATABASE_URL);
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  console.log(`Clearing database at ${databaseUrl.host}${databaseUrl.pathname}`);

  const before = await Promise.all([
    prisma.requestFollowUp.count(),
    prisma.request.count(),
    prisma.aiProviderStatus.count(),
  ]);

  const [followUps, requests, providerStatuses] = await prisma.$transaction([
    prisma.requestFollowUp.deleteMany(),
    prisma.request.deleteMany(),
    prisma.aiProviderStatus.deleteMany(),
  ]);

  console.log("Deleted rows:");
  console.log(`- RequestFollowUp: ${followUps.count} of ${before[0]}`);
  console.log(`- Request: ${requests.count} of ${before[1]}`);
  console.log(`- AiProviderStatus: ${providerStatuses.count} of ${before[2]}`);
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
