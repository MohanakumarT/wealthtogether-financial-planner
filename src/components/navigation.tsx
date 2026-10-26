import { Landmark } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuthNavigationActions } from "@/components/auth/auth-navigation-actions";

const links = [
  { label: "Home", href: "/" },
  { label: "Calculators", href: "/#calculators" },
  { label: "About", href: "/#why" },
  { label: "Contact", href: "/contact" },
];

function NavigationLinks({
  className,
  linkClassName,
}: {
  className: string;
  linkClassName: string;
}) {
  return (
    <div className={className}>
      {links.map((link) => (
        <Link className={linkClassName} href={link.href} key={link.label}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function Navigation() {
  return (
    <header className="border-border/80 bg-background/95 sticky top-0 z-40 border-b backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="px-content mx-auto flex h-16 max-w-7xl items-center justify-between"
      >
        <Link
          aria-label="WealthTogether Investments home"
          className="flex shrink-0 items-center gap-3"
          href="/"
        >
          <span className="bg-navy text-gold grid size-9 place-items-center rounded-xl">
            <Landmark aria-hidden="true" className="size-[18px]" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">
              WealthTogether
            </span>
            <span className="text-muted-foreground block text-[10px] font-medium tracking-[0.17em] uppercase">
              Investments
            </span>
          </span>
        </Link>
        <NavigationLinks
          className="hidden items-center gap-6 lg:flex"
          linkClassName="text-muted-foreground hover:text-foreground text-sm transition-colors"
        />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthNavigationActions />
        </div>
      </nav>
      <div className="px-content mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 pb-3 lg:hidden">
        <NavigationLinks
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
          linkClassName="text-muted-foreground hover:text-foreground text-xs transition-colors"
        />
        <AuthNavigationActions mobile />
      </div>
    </header>
  );
}
