import Link from "next/link";
import {
  BookOpen,
  Calculator,
  GraduationCap,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Eyebrow, SectionHeading } from "@/components/ui/typography";

const sections = [
  {
    icon: BookOpen,
    title: "Financial Education",
    description:
      "Learn mutual funds, SIPs, insurance and personal finance through simple educational resources.",
    button: "Explore Learning →",
    href: "/services",
  },
  {
    icon: Calculator,
    title: "Premium Calculators",
    description:
      "Use interactive calculators to plan retirement, children's education, SIPs, emergency funds and financial goals.",
    button: "Explore Calculators →",
    href: "/calculators",
  },
  {
    icon: GraduationCap,
    title: "Educational Consultation",
    description:
      "Book a one-to-one educational consultation to better understand financial concepts before making investment decisions.",
    button: "Book Consultation →",
    href: "/consultation",
  },
];

export function Ecosystem() {
  return (
    <section
      id="ecosystem"
      className="px-content mx-auto max-w-7xl py-20 sm:py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <Eyebrow>EXPLORE WEALTHTOGETHER</Eyebrow>

        <SectionHeading className="mt-3 text-3xl sm:text-4xl">
          Everything You Need to Build Financial Confidence
        </SectionHeading>

        <p className="text-muted-foreground mt-5 text-base leading-7">
          Simple financial education, interactive calculators and one-to-one
          guidance to help you make informed financial decisions with
          confidence.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {sections.map(({ icon: Icon, title, description, button, href }) => (
          <Link key={title} href={href} className="block">
            <Card className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/0.3 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#D4AF37]/40 hover:bg-white/0.5">
              <div className="bg-gold/10 text-gold flex h-14 w-14 items-center justify-center rounded-2xl">
                <Icon className="h-7 w-7" />
              </div>

              <h3 className="font-display mt-6 text-2xl">
                {title}
              </h3>

              <p className="text-muted-foreground mt-4 flex-1 leading-7">
                {description}
              </p>

              <div className="mt-8 border-t border-white/10 pt-5">
                <span className="text-gold font-semibold transition-colors group-hover:opacity-80">
                  {button}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="bg-navy mt-16 rounded-3xl px-8 py-12 text-center text-white">
        <p className="text-gold text-sm font-semibold tracking-[0.25em] uppercase">
          Our Mission
        </p>

        <h3 className="mt-4 text-3xl font-bold">
          Invest Money. Invest Time. Build Life.
        </h3>

        <p className="mx-auto mt-6 max-w-3xl leading-7 text-white/75">
          WealthTogether exists to simplify financial education and empower
          individuals and families to make confident financial decisions
          through practical learning, planning tools and educational guidance.
        </p>
      </div>
    </section>
  );
}