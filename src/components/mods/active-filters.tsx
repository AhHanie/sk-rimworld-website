"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SelectedTag {
  tag: string;
  label: string;
}

export function ActiveFilters({
  selectedTags,
  selectedVersions,
  hasQuery,
  onRemoveTag,
  onRemoveVersion,
  onClearAll,
}: {
  selectedTags: SelectedTag[];
  selectedVersions: string[];
  hasQuery: boolean;
  onRemoveTag: (tag: string) => void;
  onRemoveVersion: (version: string) => void;
  onClearAll: () => void;
}) {
  if (selectedTags.length === 0 && selectedVersions.length === 0 && !hasQuery) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selectedTags.map(({ tag, label }) => (
        <Badge key={`tag-${tag}`} variant="secondary" className="gap-1 pr-1">
          {label}
          <button
            type="button"
            onClick={() => onRemoveTag(tag)}
            aria-label={`Remove ${label} tag filter`}
            className="rounded-full p-0.5 hover:bg-foreground/10"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </Badge>
      ))}
      {selectedVersions.map((version) => (
        <Badge key={`version-${version}`} variant="secondary" className="gap-1 pr-1">
          {version}
          <button
            type="button"
            onClick={() => onRemoveVersion(version)}
            aria-label={`Remove ${version} version filter`}
            className="rounded-full p-0.5 hover:bg-foreground/10"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={onClearAll}>
        Clear all filters
      </Button>
    </div>
  );
}
