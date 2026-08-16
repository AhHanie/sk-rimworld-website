import { PageContainer } from "@/components/layout/page-container";
import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t">
      <PageContainer className="flex flex-col gap-2 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {SITE_NAME}. Not affiliated with
          Ludeon Studios or Valve.
        </p>
        <p>
          Mods hosted on the{" "}
          <a
            href="https://store.steampowered.com/curator/steamworkshop"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Steam Workshop
          </a>
          .
        </p>
      </PageContainer>
    </footer>
  );
}
