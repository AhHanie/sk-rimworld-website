import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ModCatalogSchema } from "../src/lib/mod-schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataPath = path.join(rootDir, "src", "data", "mods.json");
const publicDir = path.join(rootDir, "public");

function fail(message: string): never {
  console.error(`\n✖ mod data validation failed\n\n${message}\n`);
  process.exit(1);
}

function main() {
  if (!existsSync(dataPath)) {
    fail(`Missing data file: ${path.relative(rootDir, dataPath)}`);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(dataPath, "utf-8"));
  } catch (error) {
    fail(
      `src/data/mods.json is not valid JSON.\n  ${(error as Error).message}`,
    );
  }

  const result = ModCatalogSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - [${issue.path.join(".") || "root"}] ${issue.message}`)
      .join("\n");
    fail(`Schema validation errors in src/data/mods.json:\n${issues}`);
  }

  const { mods } = result.data;
  const missingImages: string[] = [];

  for (const mod of mods) {
    const relativeSrc = mod.previewImage.src.replace(/^\/+/, "");
    const absoluteSrc = path.join(publicDir, relativeSrc);

    if (!existsSync(absoluteSrc)) {
      missingImages.push(
        `  - mod "${mod.steamWorkshopId}" (${mod.name}): expected preview image at public/${relativeSrc}`,
      );
    }
  }

  if (missingImages.length > 0) {
    fail(`Missing preview image files:\n${missingImages.join("\n")}`);
  }

  console.log(
    `✔ mod data valid: ${mods.length} mod${mods.length === 1 ? "" : "s"} checked, all preview images present.`,
  );
}

main();
