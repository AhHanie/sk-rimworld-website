import { ModCard } from "@/components/mods/mod-card";
import type { CatalogMod } from "@/types/mod";

export function ModGrid({ mods }: { mods: CatalogMod[] }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 [@media(min-width:1440px)]:grid-cols-4">
      {mods.map((mod) => (
        <li key={mod.steamWorkshopId}>
          <ModCard mod={mod} />
        </li>
      ))}
    </ul>
  );
}
