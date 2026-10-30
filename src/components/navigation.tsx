import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AuthNavigationActions } from "@/components/auth/auth-navigation-actions";

const links = [
  { label: "Home", href: "/" },
  { label: "Calculators", href: "/#calculators" },
  { label: "Services", href: "/services" },
  { label: "Testimonials", href: "/testimonials" },
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
        <Link
          key={link.label}
          href={link.href}
          className={linkClassName}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function Navigation() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="px-content mx-auto flex h-16 max-w-7xl items-center justify-between"
      >
        <Link
          href="/"
          aria-label="WealthTogether Investments home"
          className="flex items-center gap-3"
        >
          <Image
            src="/logo.png"
            alt="WealthTogether Investments"
            width={48}
            height={48}
            priority
            className="rounded-lg"
          />

          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">
              WealthTogether
            </p>

            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.17em]">
              Investments
            </p>
          </div>
        </Link>

        <NavigationLinks
          className="hidden items-center gap-6 lg:flex"
          linkClassName="text-sm text-muted-foreground transition-colors hover:text-foreground"
        />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthNavigationActions />
        </div>
      </nav>

      <div className="px-content mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 pb-3 lg:hidden">
        <NavigationLinks
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
          linkClassName="text-xs text-muted-foreground transition-colors hover:text-foreground"
        />
        <AuthNavigationActions mobile />
      </div>
    </header>
  );
}