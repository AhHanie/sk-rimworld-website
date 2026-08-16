import { z } from "zod";

const STEAM_WORKSHOP_ID_PATTERN = /^\d+$/;
const KEBAB_CASE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const GAME_VERSION_PATTERN = /^\d+\.\d+$/;

function extractWorkshopIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("id");
  } catch {
    return null;
  }
}

export const ModPreviewImageSchema = z.object({
  src: z.string().min(1, "previewImage.src is required"),
  alt: z.string().trim().min(1, "previewImage.alt must not be empty"),
  width: z.number().int().positive("previewImage.width must be positive"),
  height: z.number().int().positive("previewImage.height must be positive"),
});

export const ModSchema = z
  .object({
    steamWorkshopId: z
      .string()
      .regex(
        STEAM_WORKSHOP_ID_PATTERN,
        "steamWorkshopId must contain only digits",
      ),
    slug: z
      .string()
      .trim()
      .min(1, "slug must not be empty")
      .regex(KEBAB_CASE_PATTERN, "slug must be lowercase kebab-case"),
    name: z.string().trim().min(1, "name must not be empty"),
    description: z.string().trim().min(1, "description must not be empty"),
    previewImage: ModPreviewImageSchema,
    tags: z
      .array(
        z
          .string()
          .trim()
          .min(1, "tag must not be empty")
          .regex(KEBAB_CASE_PATTERN, "tag must be lowercase kebab-case"),
      )
      .min(1, "at least one tag is required")
      .superRefine((tags, ctx) => {
        const seen = new Set<string>();
        for (const tag of tags) {
          if (seen.has(tag)) {
            ctx.addIssue({
              code: "custom",
              message: `duplicate tag "${tag}"`,
            });
          }
          seen.add(tag);
        }
      }),
    supportedVersions: z
      .array(
        z
          .string()
          .trim()
          .regex(
            GAME_VERSION_PATTERN,
            "supportedVersions entries must use major.minor format (e.g. \"1.5\")",
          ),
      )
      .min(1, "at least one supported version is required")
      .superRefine((versions, ctx) => {
        const seen = new Set<string>();
        for (const version of versions) {
          if (seen.has(version)) {
            ctx.addIssue({
              code: "custom",
              message: `duplicate supported version "${version}"`,
            });
          }
          seen.add(version);
        }
      }),
    uploadDate: z.string().refine((value) => {
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)) {
        return false;
      }
      return !Number.isNaN(Date.parse(value));
    }, "uploadDate must be a valid UTC ISO-8601 instant (e.g. 2025-03-15T00:00:00.000Z)"),
    workshopUrl: z
      .url({ protocol: /^https$/, hostname: /^steamcommunity\.com$/ })
      .refine(
        (url) => url.startsWith("https://steamcommunity.com/sharedfiles/filedetails/"),
        "workshopUrl must be a Steam Workshop file details URL",
      ),
  })
  .superRefine((mod, ctx) => {
    if (!mod.previewImage.src.startsWith(`/mods/${mod.steamWorkshopId}/`)) {
      ctx.addIssue({
        code: "custom",
        path: ["previewImage", "src"],
        message: `previewImage.src must begin with /mods/${mod.steamWorkshopId}/`,
      });
    }

    const workshopUrlId = extractWorkshopIdFromUrl(mod.workshopUrl);
    if (workshopUrlId !== mod.steamWorkshopId) {
      ctx.addIssue({
        code: "custom",
        path: ["workshopUrl"],
        message: `workshopUrl id (${workshopUrlId ?? "missing"}) must match steamWorkshopId (${mod.steamWorkshopId})`,
      });
    }
  });

export const ModCatalogSchema = z
  .object({
    schemaVersion: z.literal(1, {
      error: "schemaVersion must be 1",
    }),
    mods: z.array(ModSchema),
  })
  .superRefine((data, ctx) => {
    const seenIds = new Set<string>();
    const seenSlugs = new Set<string>();

    data.mods.forEach((mod, index) => {
      if (seenIds.has(mod.steamWorkshopId)) {
        ctx.addIssue({
          code: "custom",
          path: ["mods", index, "steamWorkshopId"],
          message: `duplicate steamWorkshopId "${mod.steamWorkshopId}"`,
        });
      }
      seenIds.add(mod.steamWorkshopId);

      if (seenSlugs.has(mod.slug)) {
        ctx.addIssue({
          code: "custom",
          path: ["mods", index, "slug"],
          message: `duplicate slug "${mod.slug}"`,
        });
      }
      seenSlugs.add(mod.slug);
    });
  });

export type ModSchemaInput = z.input<typeof ModCatalogSchema>;
