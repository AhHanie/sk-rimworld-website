"use client";

import * as React from "react";
import { GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { VersionCount } from "@/types/mod";

interface VersionFilterPanelProps {
  availableVersions: VersionCount[];
  selectedVersions: string[];
  onToggleVersion: (version: string) => void;
  onClearVersions: () => void;
}

function VersionFilterPanel({
  availableVersions,
  selectedVersions,
  onToggleVersion,
  onClearVersions,
}: VersionFilterPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Matches any selected version</p>
        {selectedVersions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs"
            onClick={onClearVersions}
          >
            Clear versions
          </Button>
        )}
      </div>

      <ul
        className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-1"
        role="group"
        aria-label="Available game versions"
      >
        {availableVersions.length === 0 && (
          <li className="px-1 py-2 text-sm text-muted-foreground">No versions available.</li>
        )}
        {availableVersions.map((version) => {
          const checkboxId = `version-${version.version}`;
          const isChecked = selectedVersions.includes(version.version);
          return (
            <li
              key={version.version}
              className="flex items-center gap-2 rounded-sm px-1 py-1.5 hover:bg-accent"
            >
              <Checkbox
                id={checkboxId}
                checked={isChecked}
                onCheckedChange={() => onToggleVersion(version.version)}
              />
              <Label
                htmlFor={checkboxId}
                className="flex flex-1 cursor-pointer items-center justify-between text-sm font-normal"
              >
                <span>{version.version}</span>
                <span className="text-xs text-muted-foreground">{version.count}</span>
              </Label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ModVersionFilter(props: VersionFilterPanelProps) {
  const { selectedVersions } = props;
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const triggerLabel = (
    <>
      <GitBranch className="size-4" aria-hidden="true" />
      Versions
      {selectedVersions.length > 0 && (
        <Badge variant="secondary" className="ml-1 rounded-full px-1.5">
          {selectedVersions.length}
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
          <PopoverContent align="start" className="w-64">
            <VersionFilterPanel {...props} />
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
              <SheetTitle>Filter by version</SheetTitle>
              <SheetDescription>
                Select one or more RimWorld versions to narrow the mod list.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-4">
              <VersionFilterPanel {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
