// =============================================================================
// Prisma Client Singleton (Prisma 7 + pg adapter)
// =============================================================================
// In development, Next.js hot-reloads on every change, which can quickly exhaust
// database connections if a new PrismaClient is instantiated each time.
//
// This module ensures only ONE PrismaClient instance is created and reused
// across hot-reloads by caching it on the `globalThis` object.
//
// Prisma 7 requires either an `adapter` or `accelerateUrl` in the PrismaClient
// constructor. We use the pg adapter with a direct TCP connection for local dev.
// =============================================================================

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Get the direct PostgreSQL connection string
function getDirectUrl(): string {
  if (process.env.DIRECT_DATABASE_URL) return process.env.DIRECT_DATABASE_URL;
  // Decode from Prisma Postgres API key
  const raw = process.env.DATABASE_URL || "";
  const match = raw.match(/api_key=([A-Za-z0-9+/=]+)/);
  if (match) {
    try {
      const decoded = JSON.parse(Buffer.from(match[1], "base64").toString());
      if (decoded.databaseUrl) return decoded.databaseUrl;
    } catch { /* fall through */ }
  }
  return raw;
}

function makePrisma() {
  const pool = new pg.Pool({ connectionString: getDirectUrl() });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
