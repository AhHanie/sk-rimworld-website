import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CatalogEmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <PackageSearch className="size-10 text-muted-foreground" aria-hidden="true" />
      {hasActiveFilters ? (
        <>
          <p className="text-base font-medium">No mods match your search or filters</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a different search term or clear the active filters to see the full catalog.
          </p>
          <Button variant="outline" onClick={onClearFilters}>
            Clear all filters
          </Button>
        </>
      ) : (
        <>
          <p className="text-base font-medium">No mods yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Check back soon. Mods will appear here once they&apos;re added to the catalog.
          </p>
        </>
      )}
    </div>
  );
}
