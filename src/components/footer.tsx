import Link from "next/link";
import { Landmark } from "lucide-react";

const footerLinks = [
  { label: "Features", href: "/#features" },
  { label: "Services", href: "/services" },
  { label: "Planning categories", href: "/#calculators" },
  { label: "Frequently asked questions", href: "/#faq" },
  { label: "Portfolio tracker", href: "/portfolio" },
  { label: "Family dashboard", href: "/family" },
  { label: "Book a consultation", href: "/consultation" },
  { label: "Contact", href: "/contact" },
  { label: "Get started", href: "/#get-started" },
];

export function Footer() {
  return (
    <footer className="border-border bg-card border-t" id="disclosures">
      <div className="px-content mx-auto max-w-7xl py-9">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <Link className="flex items-center gap-2.5" href="/">
            <span className="bg-navy text-gold grid size-8 place-items-center rounded-lg">
              <Landmark aria-hidden="true" className="size-4" />
            </span>
            <span className="text-sm font-semibold">
              WealthTogether Investments
            </span>
          </Link>
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-3"
          >
            {footerLinks.map((link) => (
              <Link
                className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                href={link.href}
                key={link.label}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-border text-muted-foreground mt-7 flex flex-col gap-2 border-t pt-5 text-[11px] leading-5 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-3xl">
            WealthTogether provides educational planning experiences, not
            individualized investment, legal, or tax advice. Consider your
            circumstances and consult a qualified professional when appropriate.
            Investing involves risk, including possible loss of principal.
          </p>
          <p className="shrink-0">
            © {new Date().getFullYear()} WealthTogether Investments
          </p>
        </div>
      </div>
    </footer>
  );
}
