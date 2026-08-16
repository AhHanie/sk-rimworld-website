export const SITE_NAME = "Sk's Rimworld Mods";

export const SITE_DESCRIPTION =
  "Browse Sk's Rimworld mods on the Steam Workshop: search, filter by tag, and jump straight to each mod's Workshop page.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const PLACEHOLDER_IMAGE_SRC = "/images/mod-placeholder.svg";

export const SORT_LABELS: Record<
  "name-asc" | "name-desc" | "upload-date-desc" | "upload-date-asc",
  string
> = {
  "upload-date-desc": "Newest first",
  "upload-date-asc": "Oldest first",
  "name-asc": "Name (A–Z)",
  "name-desc": "Name (Z–A)",
};

export const DEFAULT_SORT = "upload-date-desc" as const;
