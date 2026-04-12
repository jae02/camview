#!/usr/bin/env npx tsx
/**
 * =============================================================================
 * Merge Seeds — Consolidate individual camera JSONs into one seed file
 * =============================================================================
 * Reads all *.json files in data/seeds/ (except all_cameras_seed.json),
 * deduplicates by slug, and writes the combined array to all_cameras_seed.json.
 *
 * Usage:
 *   npx tsx scripts/merge-seeds.ts
 * =============================================================================
 */

import fs from "fs";
import path from "path";

const SEEDS_DIR = path.resolve(__dirname, "..", "data", "seeds");
const OUTPUT_FILE = path.join(SEEDS_DIR, "all_cameras_seed.json");

interface CameraRecord {
  slug: string;
  [key: string]: unknown;
}

function main() {
  console.log("🔀 Merging seed files...\n");

  const files = fs
    .readdirSync(SEEDS_DIR)
    .filter(
      (f) =>
        f.endsWith(".json") &&
        f !== "all_cameras_seed.json" &&
        !f.startsWith(".")
    )
    .sort();

  if (files.length === 0) {
    console.warn("⚠  No individual seed JSON files found in", SEEDS_DIR);
    process.exit(1);
  }

  const slugMap = new Map<string, CameraRecord>();

  for (const file of files) {
    const filePath = path.join(SEEDS_DIR, file);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);

      // Handle both single-object and array formats
      const records: CameraRecord[] = Array.isArray(data) ? data : [data];

      for (const record of records) {
        if (record.slug) {
          slugMap.set(record.slug, record);
          console.log(`  ✓ ${record.slug} (from ${file})`);
        }
      }
    } catch (err) {
      console.error(`  ✕ Failed to parse ${file}:`, err);
    }
  }

  const merged = Array.from(slugMap.values());

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2), "utf-8");

  console.log(`\n✅ Merged ${merged.length} cameras → ${OUTPUT_FILE}`);
}

main();
