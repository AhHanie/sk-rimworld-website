"use client";

import * as React from "react";
import { ListFilter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { normalizeSearchText } from "@/lib/catalog";
import type { TagCount } from "@/types/mod";

interface TagFilterPanelProps {
  availableTags: TagCount[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

function TagFilterPanel({
  availableTags,
  selectedTags,
  onToggleTag,
  onClearTags,
}: TagFilterPanelProps) {
  const [tagQuery, setTagQuery] = React.useState("");

  const visibleTags = React.useMemo(() => {
    const normalized = normalizeSearchText(tagQuery);
    if (!normalized) return availableTags;
    return availableTags.filter((tag) =>
      normalizeSearchText(tag.label).includes(normalized),
    );
  }, [availableTags, tagQuery]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Matches any selected tag</p>
        {selectedTags.length > 0 && (
          <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={onClearTags}>
            Clear tags
          </Button>
        )}
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Label htmlFor="tag-filter-search" className="sr-only">
          Search tags
        </Label>
        <Input
          id="tag-filter-search"
          value={tagQuery}
          onChange={(event) => setTagQuery(event.target.value)}
          placeholder="Search tags…"
          className="h-8 pl-8 text-sm"
        />
      </div>

      <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-1" role="group" aria-label="Available tags">
        {visibleTags.length === 0 && (
          <li className="px-1 py-2 text-sm text-muted-foreground">No tags match &ldquo;{tagQuery}&rdquo;.</li>
        )}
        {visibleTags.map((tag) => {
          const checkboxId = `tag-${tag.tag}`;
          const isChecked = selectedTags.includes(tag.tag);
          return (
            <li key={tag.tag} className="flex items-center gap-2 rounded-sm px-1 py-1.5 hover:bg-accent">
              <Checkbox
                id={checkboxId}
                checked={isChecked}
                onCheckedChange={() => onToggleTag(tag.tag)}
              />
              <Label htmlFor={checkboxId} className="flex flex-1 cursor-pointer items-center justify-between text-sm font-normal">
                <span>{tag.label}</span>
                <span className="text-xs text-muted-foreground">{tag.count}</span>
              </Label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ModTagFilter(props: TagFilterPanelProps) {
  const { selectedTags } = props;
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const triggerLabel = (
    <>
      <ListFilter className="size-4" aria-hidden="true" />
      Tags
      {selectedTags.length > 0 && (
        <Badge variant="secondary" className="ml-1 rounded-full px-1.5">
          {selectedTags.length}
        </Badge>
      )}
    </>
  );

  return (
    <>
      <div className="hidden sm:block">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              {triggerLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72">
            <TagFilterPanel {...props} />
          </PopoverContent>
        </Popover>
      </div>

      <div className="sm:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              {triggerLabel}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filter by tag</SheetTitle>
              <SheetDescription>Select one or more tags to narrow the mod list.</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-4">
              <TagFilterPanel {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
