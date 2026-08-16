import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { Navigation } from "@/components/layout/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SITE_NAME } from "@/lib/constants";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <PageContainer className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          {SITE_NAME}
        </Link>
        <div className="flex items-center gap-6">
          <Navigation />
          <ThemeToggle />
        </div>
      </PageContainer>
    </header>
  );
}
