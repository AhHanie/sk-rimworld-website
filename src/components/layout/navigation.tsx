import Link from "next/link";

const NAV_LINKS = [{ href: "/", label: "Mods" }];

export function Navigation() {
  return (
    <nav aria-label="Primary">
      <ul className="flex items-center gap-6 text-sm font-medium">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
