import Link from "next/link";
import { BookOpen, Calculator, GraduationCap } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Eyebrow, SectionHeading } from "@/components/ui/typography";

const features = [
  {
    icon: BookOpen,
    title: "Financial Education",
    description:
      "Understand mutual funds, SIPs, insurance and personal finance through simple learning resources written for beginners.",
    href: "/services",
  },
  {
    icon: Calculator,
    title: "Premium Calculators",
    description:
      "Plan retirement, children's education, SIPs and financial goals using interactive calculators and planning tools.",
    href: "/calculators",
  },
  {
    icon: GraduationCap,
    title: "Educational Consultation",
    description:
      "Book a one-to-one educational session to understand investment concepts and available options before making financial decisions.",
    href: "/consultation",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="px-content mx-auto max-w-7xl py-20 sm:py-24"
    >
      <div className="max-w-3xl">
        <Eyebrow>FINANCIAL EDUCATION MADE SIMPLE</Eyebrow>

        <SectionHeading className="mt-3 text-3xl sm:text-4xl">
          Understand Money.
          <br />
          Build Wealth.
          <br />
          Make Better Decisions.
        </SectionHeading>

        <p className="text-muted-foreground mt-5 text-base leading-7">
          Learn investing through simple explanations, interactive calculators
          and educational consultations. We help you understand financial
          concepts so you can make informed decisions with confidence.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description, href }, index) => (
          <Link key={title} href={href} className="block">
            <Card className="group h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#D4AF37]/40 hover:bg-white/[0.05]">
              <span className="bg-gold/15 text-gold grid size-14 place-items-center rounded-2xl">
                <Icon className="size-6" />
              </span>

              <p className="text-gold mt-8 text-xs font-semibold tracking-[0.2em]">
                0{index + 1}
              </p>

              <h3 className="font-display mt-3 text-2xl tracking-tight">
                {title}
              </h3>

              <p className="text-muted-foreground mt-4 leading-7">
                {description}
              </p>

              <div className="mt-8 flex items-center text-sm font-semibold text-[#D4AF37] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Learn More
                <span className="ml-2">→</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}