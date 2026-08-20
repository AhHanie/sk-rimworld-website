import "server-only";
import path from "node:path";
import Database from "better-sqlite3";

const STEAM_WORKSHOP_ID_PATTERN = /^\d+$/;

const LATEST_RATINGS_QUERY = `
  SELECT steam_workshop_id, ratings
  FROM (
    SELECT
      steam_workshop_id,
      ratings,
      ROW_NUMBER() OVER (
        PARTITION BY steam_workshop_id
        ORDER BY collected_at_utc DESC, id DESC
      ) AS row_number
    FROM workshop_stats
  ) AS latest
  WHERE row_number = 1
    AND ratings IS NOT NULL
`;

interface RawRatingRow {
  steam_workshop_id: unknown;
  ratings: unknown;
}

let cachedRatings: ReadonlyMap<string, number> | null = null;

function resolveDatabasePath(): string {
  return path.join(process.cwd(), "data", "workshop_stats.db");
}

function queryLatestRatings(dbPath: string): RawRatingRow[] {
  let db: Database.Database;

  try {
    db = new Database(dbPath, { readonly: true, fileMustExist: true });
  } catch (error) {
    throw new Error(
      `Cannot open workshop stats database at "${dbPath}": ${(error as Error).message}`,
    );
  }

  try {
    return db.prepare(LATEST_RATINGS_QUERY).all() as RawRatingRow[];
  } catch (error) {
    throw new Error(
      `Failed to query workshop stats database at "${dbPath}": ${(error as Error).message}`,
    );
  } finally {
    db.close();
  }
}

function buildRatingsMap(
  rows: RawRatingRow[],
  dbPath: string,
): ReadonlyMap<string, number> {
  const ratings = new Map<string, number>();

  for (const row of rows) {
    const { steam_workshop_id: id, ratings: value } = row;

    if (typeof id !== "string" || !STEAM_WORKSHOP_ID_PATTERN.test(id)) {
      throw new Error(
        `Invalid steam_workshop_id ${JSON.stringify(id)} in workshop stats database at "${dbPath}"`,
      );
    }

    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
      throw new Error(
        `Invalid ratings value ${JSON.stringify(value)} for steam_workshop_id "${id}" in workshop stats database at "${dbPath}"`,
      );
    }

    ratings.set(id, value);
  }

  return ratings;
}

// Exported uncached so tests can point it at a fixture database.
export function loadWorkshopRatingsFromDatabase(
  dbPath: string,
): ReadonlyMap<string, number> {
  return buildRatingsMap(queryLatestRatings(dbPath), dbPath);
}

export function getWorkshopRatings(): ReadonlyMap<string, number> {
  if (cachedRatings === null) {
    cachedRatings = loadWorkshopRatingsFromDatabase(resolveDatabasePath());
  }
  return cachedRatings;
}

export function __resetWorkshopRatingsCacheForTests(): void {
  cachedRatings = null;
}
