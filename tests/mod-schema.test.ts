import { describe, expect, it } from "vitest";
import { ModCatalogSchema } from "@/lib/mod-schema";

function validCatalog(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    mods: [
      {
        steamWorkshopId: "1234567890",
        slug: "example-mod",
        name: "Example Mod",
        description: "A complete description.",
        previewImage: {
          src: "/mods/1234567890/preview.webp",
          alt: "Preview artwork",
          width: 640,
          height: 360,
        },
        tags: ["quality-of-life", "ui"],
        supportedVersions: ["1.5", "1.6"],
        uploadDate: "2025-03-15T00:00:00.000Z",
        workshopUrl:
          "https://steamcommunity.com/sharedfiles/filedetails/?id=1234567890",
      },
    ],
    ...overrides,
  };
}

describe("ModCatalogSchema", () => {
  it("accepts a valid catalog", () => {
    const result = ModCatalogSchema.safeParse(validCatalog());
    expect(result.success).toBe(true);
  });

  it("accepts an empty mod list", () => {
    const result = ModCatalogSchema.safeParse(validCatalog({ mods: [] }));
    expect(result.success).toBe(true);
  });

  it("rejects an unsupported schemaVersion", () => {
    const result = ModCatalogSchema.safeParse(validCatalog({ schemaVersion: 2 }));
    expect(result.success).toBe(false);
  });

  it("rejects a non-digit steamWorkshopId", () => {
    const catalog = validCatalog();
    // @ts-expect-error intentional invalid fixture
    catalog.mods[0].steamWorkshopId = "abc123";
    expect(ModCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it("rejects duplicate steamWorkshopId values", () => {
    const catalog = validCatalog();
    // @ts-expect-error intentional invalid fixture
    catalog.mods.push({ ...catalog.mods[0], slug: "example-mod-2" });
    expect(ModCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it("rejects duplicate slugs", () => {
    const catalog = validCatalog();
    // @ts-expect-error intentional invalid fixture
    catalog.mods.push({
      ...catalog.mods[0],
      steamWorkshopId: "999",
    });
    expect(ModCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it("rejects a workshopUrl id that does not match steamWorkshopId", () => {
    const catalog = validCatalog();
    // @ts-expect-error intentional invalid fixture
    catalog.mods[0].workshopUrl =
      "https://steamcommunity.com/sharedfiles/filedetails/?id=999";
    expect(ModCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it("rejects a previewImage.src that doesn't start with /mods/<id>/", () => {
    const catalog = validCatalog();
    // @ts-expect-error intentional invalid fixture
    catalog.mods[0].previewImage.src = "/mods/other-id/preview.webp";
    expect(ModCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it("rejects an invalid uploadDate", () => {
    const catalog = validCatalog();
    // @ts-expect-error intentional invalid fixture
    catalog.mods[0].uploadDate = "not-a-date";
    expect(ModCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it("rejects duplicate tags within one mod", () => {
    const catalog = validCatalog();
    // @ts-expect-error intentional invalid fixture
    catalog.mods[0].tags = ["ui", "ui"];
    expect(ModCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it("rejects an empty name or description", () => {
    const catalog = validCatalog();
    // @ts-expect-error intentional invalid fixture
    catalog.mods[0].name = "";
    expect(ModCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it("rejects a non-kebab-case slug", () => {
    const catalog = validCatalog();
    // @ts-expect-error intentional invalid fixture
    catalog.mods[0].slug = "Example Mod";
    expect(ModCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it("rejects an empty supportedVersions list", () => {
    const catalog = validCatalog();
    // @ts-expect-error intentional invalid fixture
    catalog.mods[0].supportedVersions = [];
    expect(ModCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it("rejects a malformed supported version", () => {
    const catalog = validCatalog();
    // @ts-expect-error intentional invalid fixture
    catalog.mods[0].supportedVersions = ["1.5.0"];
    expect(ModCatalogSchema.safeParse(catalog).success).toBe(false);
  });

  it("rejects duplicate supported versions within one mod", () => {
    const catalog = validCatalog();
    // @ts-expect-error intentional invalid fixture
    catalog.mods[0].supportedVersions = ["1.5", "1.5"];
    expect(ModCatalogSchema.safeParse(catalog).success).toBe(false);
  });
});
