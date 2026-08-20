import type { z } from "zod";
import { ModCatalogSchema } from "@/lib/mod-schema";
import { getWorkshopRatings } from "@/lib/workshop-ratings.server";
import rawModData from "@/data/mods.json";
import type { CatalogMod, Mod } from "@/types/mod";

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - [${issue.path.join(".") || "root"}] ${issue.message}`)
    .join("\n");
}

function loadMods(): Mod[] {
  const result = ModCatalogSchema.safeParse(rawModData);

  if (!result.success) {
    throw new Error(
      `Invalid mod data in src/data/mods.json:\n${formatZodError(result.error)}`,
    );
  }

  return result.data.mods;
}

export const mods: Mod[] = loadMods();

export function getMods(): Mod[] {
  return mods;
}

export function getCatalogMods(): CatalogMod[] {
  const ratings = getWorkshopRatings();

  return mods.map((mod) => {
    const positiveRatingCount = ratings.get(mod.steamWorkshopId);
    return positiveRatingCount === undefined
      ? { ...mod }
      : { ...mod, positiveRatingCount };
  });
}
