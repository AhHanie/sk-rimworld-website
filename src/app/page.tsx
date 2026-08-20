import { PageContainer } from "@/components/layout/page-container";
import { ModCatalog } from "@/components/mods/mod-catalog";
import { getCatalogMods } from "@/lib/mods";

export default function Home() {
  const mods = getCatalogMods();

  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Sk&apos;s Rimworld Mods
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Browse mods on the Steam Workshop. Search by name or tag, filter the
          catalog, and jump straight to the Workshop page to subscribe.
        </p>
      </div>

      <section aria-label="Mod catalog">
        <ModCatalog mods={mods} />
      </section>
    </PageContainer>
  );
}
