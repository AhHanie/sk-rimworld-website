import { describe, expect, it } from "vitest";
import {
  compareVersionsDesc,
  filterMods,
  formatTagLabel,
  getAvailableTags,
  getAvailableVersions,
  matchesSearch,
  normalizeSearchText,
  sortMods,
} from "@/lib/catalog";
import { DEFAULT_SORT } from "@/lib/constants";
import type { CatalogFilters, CatalogMod } from "@/types/mod";

function makeMod(overrides: Partial<CatalogMod> = {}): CatalogMod {
  return {
    steamWorkshopId: "1000000000",
    slug: "sample-mod",
    name: "Sample Mod",
    description: "A sample description for testing.",
    previewImage: {
      src: "/mods/1000000000/preview.webp",
      alt: "Sample preview",
      width: 640,
      height: 360,
    },
    tags: ["quality-of-life"],
    supportedVersions: ["1.5"],
    uploadDate: "2025-01-01T00:00:00.000Z",
    workshopUrl: "https://steamcommunity.com/sharedfiles/filedetails/?id=1000000000",
    ...overrides,
  };
}

function makeFilters(overrides: Partial<CatalogFilters> = {}): CatalogFilters {
  return {
    query: "",
    selectedTags: [],
    selectedVersions: [],
    sort: "name-asc",
    ...overrides,
  };
}

describe("normalizeSearchText", () => {
  it("lowercases, trims, and collapses whitespace", () => {
    expect(normalizeSearchText("  Quality   OF Life  ")).toBe("quality of life");
  });

  it("strips diacritics", () => {
    expect(normalizeSearchText("Café Über")).toBe("cafe uber");
  });
});

describe("formatTagLabel", () => {
  it("title-cases kebab-case tags", () => {
    expect(formatTagLabel("quality-of-life")).toBe("Quality Of Life");
    expect(formatTagLabel("ui")).toBe("Ui");
  });
});

describe("matchesSearch", () => {
  it("matches partial text across name, description, and tags", () => {
    const mod = makeMod({ name: "Better Pawn Control", tags: ["ui", "utility"] });
    expect(matchesSearch(mod, "pawn")).toBe(true);
    expect(matchesSearch(mod, "utility")).toBe(true);
    expect(matchesSearch(mod, "nonexistent")).toBe(false);
  });

  it("requires every token in a multi-word query to match", () => {
    const mod = makeMod({ name: "Quality UI", tags: ["ui", "quality-of-life"] });
    expect(matchesSearch(mod, "ui quality")).toBe(true);
    expect(matchesSearch(mod, "ui missing")).toBe(false);
  });

  it("treats an empty query as matching everything", () => {
    expect(matchesSearch(makeMod(), "   ")).toBe(true);
  });
});

describe("filterMods", () => {
  const mods = [
    makeMod({
      steamWorkshopId: "1",
      slug: "a",
      name: "Alpha",
      tags: ["ui"],
      supportedVersions: ["1.5"],
    }),
    makeMod({
      steamWorkshopId: "2",
      slug: "b",
      name: "Beta",
      tags: ["utility"],
      supportedVersions: ["1.4"],
    }),
    makeMod({
      steamWorkshopId: "3",
      slug: "c",
      name: "Gamma",
      tags: ["ui", "utility"],
      supportedVersions: ["1.4", "1.5"],
    }),
  ];

  it("applies search and match-any-selected-tag filtering together", () => {
    const result = filterMods(mods, makeFilters({ selectedTags: ["ui"] }));
    expect(result.map((m) => m.name)).toEqual(["Alpha", "Gamma"]);
  });

  it("matches any of multiple selected tags", () => {
    const result = filterMods(mods, makeFilters({ selectedTags: ["ui", "utility"] }));
    expect(result).toHaveLength(3);
  });

  it("applies match-any-selected-version filtering", () => {
    const result = filterMods(mods, makeFilters({ selectedVersions: ["1.5"] }));
    expect(result.map((m) => m.name)).toEqual(["Alpha", "Gamma"]);
  });

  it("matches any of multiple selected versions", () => {
    const result = filterMods(mods, makeFilters({ selectedVersions: ["1.4", "1.5"] }));
    expect(result).toHaveLength(3);
  });

  it("combines tag and version filters", () => {
    const result = filterMods(
      mods,
      makeFilters({ selectedTags: ["utility"], selectedVersions: ["1.5"] }),
    );
    expect(result.map((m) => m.name)).toEqual(["Gamma"]);
  });
});

describe("popularity sort", () => {
  it("is the default sort", () => {
    expect(DEFAULT_SORT).toBe("popularity-desc");
  });
});

describe("sortMods", () => {
  it("sorts rated mods by descending positive-vote count and places unrated mods last", () => {
    const mods = [
      makeMod({ steamWorkshopId: "1", name: "Low", positiveRatingCount: 28 }),
      makeMod({ steamWorkshopId: "2", name: "Unrated" }),
      makeMod({ steamWorkshopId: "3", name: "High", positiveRatingCount: 416 }),
      makeMod({ steamWorkshopId: "4", name: "Mid", positiveRatingCount: 171 }),
    ];

    expect(sortMods(mods, "popularity-desc").map((m) => m.name)).toEqual([
      "High",
      "Mid",
      "Low",
      "Unrated",
    ]);
  });

  it("breaks ties among equal known counts by name then steam id", () => {
    const mods = [
      makeMod({ steamWorkshopId: "2", name: "Same", positiveRatingCount: 100 }),
      makeMod({ steamWorkshopId: "1", name: "Same", positiveRatingCount: 100 }),
    ];

    expect(sortMods(mods, "popularity-desc").map((m) => m.steamWorkshopId)).toEqual([
      "1",
      "2",
    ]);
  });

  it("breaks ties among unrated mods by name then steam id", () => {
    const mods = [
      makeMod({ steamWorkshopId: "2", name: "Zeta" }),
      makeMod({ steamWorkshopId: "1", name: "Alpha" }),
      makeMod({ steamWorkshopId: "3", name: "Alpha" }),
    ];

    expect(sortMods(mods, "popularity-desc").map((m) => m.steamWorkshopId)).toEqual([
      "1",
      "3",
      "2",
    ]);
  });

  it("treats a positive-vote count of zero as known and ranked above unrated mods", () => {
    const mods = [
      makeMod({ steamWorkshopId: "1", name: "Unrated" }),
      makeMod({ steamWorkshopId: "2", name: "Zero", positiveRatingCount: 0 }),
    ];

    expect(sortMods(mods, "popularity-desc").map((m) => m.name)).toEqual([
      "Zero",
      "Unrated",
    ]);
  });

  it("sorts by name ascending and descending", () => {
    const mods = [makeMod({ name: "Zeta" }), makeMod({ name: "Alpha" })];
    expect(sortMods(mods, "name-asc").map((m) => m.name)).toEqual(["Alpha", "Zeta"]);
    expect(sortMods(mods, "name-desc").map((m) => m.name)).toEqual(["Zeta", "Alpha"]);
  });

  it("sorts by upload date", () => {
    const mods = [
      makeMod({ name: "Old", uploadDate: "2024-01-01T00:00:00.000Z" }),
      makeMod({ name: "New", uploadDate: "2025-01-01T00:00:00.000Z" }),
    ];
    expect(sortMods(mods, "upload-date-desc").map((m) => m.name)).toEqual(["New", "Old"]);
    expect(sortMods(mods, "upload-date-asc").map((m) => m.name)).toEqual(["Old", "New"]);
  });

  it("breaks ties deterministically by name then steam id", () => {
    const mods = [
      makeMod({ steamWorkshopId: "2", name: "Same", uploadDate: "2025-01-01T00:00:00.000Z" }),
      makeMod({ steamWorkshopId: "1", name: "Same", uploadDate: "2025-01-01T00:00:00.000Z" }),
    ];
    expect(sortMods(mods, "upload-date-desc").map((m) => m.steamWorkshopId)).toEqual([
      "1",
      "2",
    ]);
  });
});

describe("getAvailableTags", () => {
  it("counts and sorts tags by display label", () => {
    const mods = [
      makeMod({ tags: ["utility"] }),
      makeMod({ tags: ["quality-of-life", "utility"] }),
    ];
    expect(getAvailableTags(mods)).toEqual([
      { tag: "quality-of-life", label: "Quality Of Life", count: 1 },
      { tag: "utility", label: "Utility", count: 2 },
    ]);
  });
});

describe("compareVersionsDesc", () => {
  it("sorts numerically, newest first, not alphabetically", () => {
    const versions = ["1.2", "1.10", "1.1"];
    expect([...versions].sort(compareVersionsDesc)).toEqual(["1.10", "1.2", "1.1"]);
  });
});

describe("getAvailableVersions", () => {
  it("counts versions and sorts them newest first", () => {
    const mods = [
      makeMod({ supportedVersions: ["1.4"] }),
      makeMod({ supportedVersions: ["1.4", "1.5"] }),
    ];
    expect(getAvailableVersions(mods)).toEqual([
      { version: "1.5", count: 1 },
      { version: "1.4", count: 2 },
    ]);
  });
});
