export interface ModPreviewImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Mod {
  steamWorkshopId: string;
  slug: string;
  name: string;
  description: string;
  previewImage: ModPreviewImage;
  tags: string[];
  supportedVersions: string[];
  uploadDate: string;
  workshopUrl: string;
}

export interface ModCatalogData {
  schemaVersion: 1;
  mods: Mod[];
}

export interface CatalogMod extends Mod {
  positiveRatingCount?: number;
}

export type ModSort =
  | "popularity-desc"
  | "name-asc"
  | "name-desc"
  | "upload-date-desc"
  | "upload-date-asc";

export interface CatalogFilters {
  query: string;
  selectedTags: string[];
  selectedVersions: string[];
  sort: ModSort;
}

export interface TagCount {
  tag: string;
  label: string;
  count: number;
}

export interface VersionCount {
  version: string;
  count: number;
}
