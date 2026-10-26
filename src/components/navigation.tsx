import { Landmark } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const links = [
  { label: "Features", href: "/#features" },
  { label: "Calculator categories", href: "/#calculators" },
  { label: "Why us", href: "/#why" },
  { label: "FAQ", href: "/#faq" },
  { label: "Consultation", href: "/consultation" },
  { label: "Contact", href: "/contact" },
  { label: "Portfolio tracker", href: "/portfolio" },
  { label: "Family dashboard", href: "/family" },
  { label: "Saved plans", href: "/history" },
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

function AccountLinks({ mobile = false }: { mobile?: boolean }) {
  if (mobile) {
    return (
      <div className="flex shrink-0 items-center gap-4">
        <Link
          className="text-muted-foreground shrink-0 text-xs"
          href="/profile"
        >
          My account
        </Link>
        <Link
          className="text-muted-foreground shrink-0 text-xs"
          href="/auth/sign-up"
        >
          Create account
        </Link>
      </div>
    );
  }

  return (
    <>
      <Button
        asChild
        className="hidden sm:inline-flex"
        size="sm"
        variant="ghost"
      >
        <Link href="/profile">My account</Link>
      </Button>
      <Button
        asChild
        className="hidden sm:inline-flex"
        size="sm"
        variant="gold"
      >
        <Link href="/auth/sign-up">Create account</Link>
      </Button>
    </>
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
          <AccountLinks />
        </div>
      </nav>
      <div className="px-content mx-auto flex max-w-7xl gap-6 overflow-x-auto pb-3 lg:hidden">
        <NavigationLinks
          className="flex shrink-0 items-center gap-6"
          linkClassName="text-muted-foreground hover:text-foreground shrink-0 text-xs transition-colors"
        />
        <AccountLinks mobile />
      </div>
    </header>
  );
}
