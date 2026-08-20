import type {
  CatalogFilters,
  CatalogMod,
  ModSort,
  TagCount,
  VersionCount,
} from "@/types/mod";

const collator = new Intl.Collator(undefined, {
  sensitivity: "base",
  numeric: true,
});

const COMBINING_DIACRITICS_PATTERN = /[̀-ͯ]/g;

export function formatTagLabel(tag: string): string {
  return tag
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS_PATTERN, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function getSearchableText(mod: CatalogMod): string {
  return normalizeSearchText(
    [
      mod.name,
      mod.description,
      mod.tags.join(" "),
      mod.tags.map(formatTagLabel).join(" "),
      mod.supportedVersions.join(" "),
    ].join(" "),
  );
}

export function matchesSearch(mod: CatalogMod, query: string): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const tokens = normalizedQuery.split(" ").filter(Boolean);
  const haystack = getSearchableText(mod);

  return tokens.every((token) => haystack.includes(token));
}

function matchesTags(mod: CatalogMod, selectedTags: string[]): boolean {
  if (selectedTags.length === 0) return true;
  return mod.tags.some((tag) => selectedTags.includes(tag));
}

function matchesVersions(mod: CatalogMod, selectedVersions: string[]): boolean {
  if (selectedVersions.length === 0) return true;
  return mod.supportedVersions.some((version) =>
    selectedVersions.includes(version),
  );
}

export function filterMods(
  mods: CatalogMod[],
  filters: CatalogFilters,
): CatalogMod[] {
  return mods.filter(
    (mod) =>
      matchesSearch(mod, filters.query) &&
      matchesTags(mod, filters.selectedTags) &&
      matchesVersions(mod, filters.selectedVersions),
  );
}

export function sortMods(mods: CatalogMod[], sort: ModSort): CatalogMod[] {
  const sorted = [...mods];

  sorted.sort((a, b) => {
    switch (sort) {
      case "popularity-desc":
        return comparePopularity(a, b);
      case "name-asc":
        return tieBreak(collator.compare(a.name, b.name), a, b);
      case "name-desc":
        return tieBreak(collator.compare(b.name, a.name), a, b);
      case "upload-date-asc":
        return tieBreak(
          Date.parse(a.uploadDate) - Date.parse(b.uploadDate),
          a,
          b,
        );
      case "upload-date-desc":
        return tieBreak(
          Date.parse(b.uploadDate) - Date.parse(a.uploadDate),
          a,
          b,
        );
      default:
        return tieBreak(0, a, b);
    }
  });

  return sorted;
}

function comparePopularity(a: CatalogMod, b: CatalogMod): number {
  const aCount = a.positiveRatingCount;
  const bCount = b.positiveRatingCount;

  if (aCount === undefined && bCount === undefined) return tieBreak(0, a, b);
  if (aCount === undefined) return 1;
  if (bCount === undefined) return -1;

  return tieBreak(bCount - aCount, a, b);
}

function tieBreak(primary: number, a: CatalogMod, b: CatalogMod): number {
  if (primary !== 0) return primary;
  const byName = collator.compare(a.name, b.name);
  if (byName !== 0) return byName;
  return collator.compare(a.steamWorkshopId, b.steamWorkshopId);
}

export function getAvailableTags(mods: CatalogMod[]): TagCount[] {
  const counts = new Map<string, number>();

  for (const mod of mods) {
    for (const tag of mod.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, label: formatTagLabel(tag), count }))
    .sort((a, b) => collator.compare(a.label, b.label));
}

export function compareVersionsDesc(a: string, b: string): number {
  const [aMajor = 0, aMinor = 0] = a.split(".").map(Number);
  const [bMajor = 0, bMinor = 0] = b.split(".").map(Number);
  return bMajor - aMajor || bMinor - aMinor;
}

export function getAvailableVersions(mods: CatalogMod[]): VersionCount[] {
  const counts = new Map<string, number>();

  for (const mod of mods) {
    for (const version of mod.supportedVersions) {
      counts.set(version, (counts.get(version) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([version, count]) => ({ version, count }))
    .sort((a, b) => compareVersionsDesc(a.version, b.version));
}
