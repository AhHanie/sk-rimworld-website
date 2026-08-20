"use client";

import * as React from "react";
import { ActiveFilters } from "@/components/mods/active-filters";
import { CatalogEmptyState } from "@/components/mods/catalog-empty-state";
import { ModGrid } from "@/components/mods/mod-grid";
import { ModSearch } from "@/components/mods/mod-search";
import { ModSort } from "@/components/mods/mod-sort";
import { ModTagFilter } from "@/components/mods/mod-tag-filter";
import { ModVersionFilter } from "@/components/mods/mod-version-filter";
import {
  filterMods,
  formatTagLabel,
  getAvailableTags,
  getAvailableVersions,
  sortMods,
} from "@/lib/catalog";
import { DEFAULT_SORT } from "@/lib/constants";
import type {
  CatalogFilters,
  CatalogMod,
  ModSort as ModSortType,
} from "@/types/mod";

export function ModCatalog({ mods }: { mods: CatalogMod[] }) {
  const [query, setQuery] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [selectedVersions, setSelectedVersions] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<ModSortType>(DEFAULT_SORT);

  const availableTags = React.useMemo(() => getAvailableTags(mods), [mods]);
  const availableVersions = React.useMemo(() => getAvailableVersions(mods), [mods]);

  const filters: CatalogFilters = React.useMemo(
    () => ({ query, selectedTags, selectedVersions, sort }),
    [query, selectedTags, selectedVersions, sort],
  );

  const visibleMods = React.useMemo(() => {
    const filtered = filterMods(mods, filters);
    return sortMods(filtered, filters.sort);
  }, [mods, filters]);

  const toggleTag = React.useCallback((tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag],
    );
  }, []);

  const removeTag = React.useCallback((tag: string) => {
    setSelectedTags((current) => current.filter((value) => value !== tag));
  }, []);

  const clearTags = React.useCallback(() => setSelectedTags([]), []);

  const toggleVersion = React.useCallback((version: string) => {
    setSelectedVersions((current) =>
      current.includes(version)
        ? current.filter((value) => value !== version)
        : [...current, version],
    );
  }, []);

  const removeVersion = React.useCallback((version: string) => {
    setSelectedVersions((current) => current.filter((value) => value !== version));
  }, []);

  const clearVersions = React.useCallback(() => setSelectedVersions([]), []);

  const clearAll = React.useCallback(() => {
    setQuery("");
    setSelectedTags([]);
    setSelectedVersions([]);
  }, []);

  if (mods.length === 0) {
    return <CatalogEmptyState hasActiveFilters={false} onClearFilters={clearAll} />;
  }

  const hasActiveFilters =
    query.trim().length > 0 || selectedTags.length > 0 || selectedVersions.length > 0;
  const selectedTagDetails = selectedTags.map((tag) => ({
    tag,
    label: formatTagLabel(tag),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ModSearch value={query} onChange={setQuery} className="w-full sm:max-w-sm" />
        <div className="flex items-center gap-3">
          <ModTagFilter
            availableTags={availableTags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            onClearTags={clearTags}
          />
          <ModVersionFilter
            availableVersions={availableVersions}
            selectedVersions={selectedVersions}
            onToggleVersion={toggleVersion}
            onClearVersions={clearVersions}
          />
          <ModSort value={sort} onChange={setSort} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {visibleMods.length} of {mods.length} mod{mods.length === 1 ? "" : "s"}
        </p>
        <ActiveFilters
          selectedTags={selectedTagDetails}
          selectedVersions={selectedVersions}
          hasQuery={query.trim().length > 0}
          onRemoveTag={removeTag}
          onRemoveVersion={removeVersion}
          onClearAll={clearAll}
        />
      </div>

      {visibleMods.length === 0 ? (
        <CatalogEmptyState hasActiveFilters={hasActiveFilters} onClearFilters={clearAll} />
      ) : (
        <ModGrid mods={visibleMods} />
      )}
    </div>
  );
}
