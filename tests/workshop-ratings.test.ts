import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  __resetWorkshopRatingsCacheForTests,
  getWorkshopRatings,
  loadWorkshopRatingsFromDatabase,
} from "@/lib/workshop-ratings.server";

interface FixtureRow {
  steamWorkshopId: string;
  ratings: number | null;
  collectedAtUtc: string;
}

const tempDirs: string[] = [];

function createFixtureDatabase(rows: FixtureRow[]): string {
  const dir = mkdtempSync(path.join(tmpdir(), "workshop-stats-"));
  tempDirs.push(dir);
  const dbPath = path.join(dir, "workshop_stats.db");
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE workshop_stats (
      id INTEGER PRIMARY KEY,
      steam_workshop_id TEXT NOT NULL,
      unique_visitors INTEGER,
      subscribers INTEGER,
      favorites INTEGER,
      ratings INTEGER,
      collected_at_utc TEXT NOT NULL
    );
  `);

  const insert = db.prepare(
    `INSERT INTO workshop_stats (steam_workshop_id, ratings, collected_at_utc) VALUES (?, ?, ?)`,
  );
  for (const row of rows) {
    insert.run(row.steamWorkshopId, row.ratings, row.collectedAtUtc);
  }

  db.close();
  return dbPath;
}

beforeEach(() => {
  __resetWorkshopRatingsCacheForTests();
});

afterEach(() => {
  __resetWorkshopRatingsCacheForTests();
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("loadWorkshopRatingsFromDatabase", () => {
  it("chooses the timestamp-latest row per Workshop ID", () => {
    const dbPath = createFixtureDatabase([
      { steamWorkshopId: "1", ratings: 10, collectedAtUtc: "2026-08-01T00:00:00.000000Z" },
      { steamWorkshopId: "1", ratings: 42, collectedAtUtc: "2026-08-10T00:00:00.000000Z" },
    ]);

    const ratings = loadWorkshopRatingsFromDatabase(dbPath);

    expect(ratings.get("1")).toBe(42);
  });

  it("omits an ID whose latest row has a NULL rating, without falling back to an older value", () => {
    const dbPath = createFixtureDatabase([
      { steamWorkshopId: "2", ratings: 15, collectedAtUtc: "2026-08-01T00:00:00.000000Z" },
      { steamWorkshopId: "2", ratings: null, collectedAtUtc: "2026-08-10T00:00:00.000000Z" },
    ]);

    const ratings = loadWorkshopRatingsFromDatabase(dbPath);

    expect(ratings.has("2")).toBe(false);
  });

  it("preserves Workshop IDs as strings", () => {
    const dbPath = createFixtureDatabase([
      { steamWorkshopId: "3536247747", ratings: 171, collectedAtUtc: "2026-08-16T12:34:54.205064Z" },
    ]);

    const ratings = loadWorkshopRatingsFromDatabase(dbPath);
    const [id] = ratings.keys();

    expect(id).toBe("3536247747");
    expect(typeof id).toBe("string");
  });

  it("rejects a non-digit Workshop ID", () => {
    const dbPath = createFixtureDatabase([
      { steamWorkshopId: "not-an-id", ratings: 10, collectedAtUtc: "2026-08-01T00:00:00.000000Z" },
    ]);

    expect(() => loadWorkshopRatingsFromDatabase(dbPath)).toThrow(/steam_workshop_id/);
  });

  it("rejects a negative ratings value", () => {
    const dbPath = createFixtureDatabase([
      { steamWorkshopId: "4", ratings: -1, collectedAtUtc: "2026-08-01T00:00:00.000000Z" },
    ]);

    expect(() => loadWorkshopRatingsFromDatabase(dbPath)).toThrow(/ratings value/);
  });

  it("throws a clear error for a missing database file", () => {
    const missingPath = path.join(tmpdir(), "does-not-exist", "workshop_stats.db");

    expect(() => loadWorkshopRatingsFromDatabase(missingPath)).toThrow(missingPath);
  });

  it("throws a clear error for a database missing the workshop_stats table", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "workshop-stats-"));
    tempDirs.push(dir);
    const dbPath = path.join(dir, "workshop_stats.db");
    new Database(dbPath).close();

    expect(() => loadWorkshopRatingsFromDatabase(dbPath)).toThrow(/workshop_stats/);
  });
});

describe("getWorkshopRatings", () => {
  it("initializes the cache only once per cache lifecycle", () => {
    const first = getWorkshopRatings();
    const second = getWorkshopRatings();

    expect(second).toBe(first);

    __resetWorkshopRatingsCacheForTests();
    const third = getWorkshopRatings();

    expect(third).not.toBe(first);
  });
});
