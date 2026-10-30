import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section className="px-content py-16 sm:py-20" id="get-started">
      <div className="bg-navy relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-16">
        {/* Decorative Circles */}
        <div
          aria-hidden="true"
          className="absolute -top-28 -right-10 size-80 rounded-full border border-white/10"
        />

        <div
          aria-hidden="true"
          className="border-gold/20 absolute -top-20 -right-1 size-64 rounded-full border"
        />

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Content */}
          <div className="max-w-2xl">
            <span className="bg-gold/15 text-gold grid size-12 place-items-center rounded-xl">
              <HeartHandshake className="size-6" />
            </span>

            <p className="text-gold mt-6 text-sm font-semibold uppercase tracking-[0.25em]">
              WealthTogether Investments
            </p>

            <h2 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Build Your Financial Future
              <br />
              With Confidence.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">
              Whether you&apos;re planning your first SIP, your child&apos;s
              education, retirement, or long-term wealth creation,
              WealthTogether helps you make confident financial decisions
              through practical financial education and easy-to-use planning
              tools.
            </p>
          </div>

          {/* Right Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" variant="gold">
              <Link href="/consultation">
                Book Consultation
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 text-white hover:bg-white/10"
            >
              <Link href="/#calculators">
                Explore Calculators
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}