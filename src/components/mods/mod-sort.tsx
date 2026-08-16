"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_LABELS } from "@/lib/constants";
import type { ModSort } from "@/types/mod";

const SORT_VALUES = Object.keys(SORT_LABELS) as ModSort[];

export function ModSort({
  value,
  onChange,
}: {
  value: ModSort;
  onChange: (value: ModSort) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="mod-sort" className="text-sm font-medium whitespace-nowrap">
        Sort by
      </Label>
      <Select value={value} onValueChange={(next) => onChange(next as ModSort)}>
        <SelectTrigger id="mod-sort" className="w-[10.5rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_VALUES.map((sortValue) => (
            <SelectItem key={sortValue} value={sortValue}>
              {SORT_LABELS[sortValue]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
