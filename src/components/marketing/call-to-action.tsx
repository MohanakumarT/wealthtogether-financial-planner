import { ArrowRight, HeartHandshake } from "lucide-react";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section className="px-content py-16 sm:py-20" id="get-started">
      <div className="bg-navy relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-16">
        <div
          aria-hidden="true"
          className="absolute -top-28 -right-10 size-80 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="border-gold/20 absolute -top-20 -right-1 size-64 rounded-full border"
        />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <span className="bg-gold/15 text-gold grid size-11 place-items-center rounded-xl">
              <HeartHandshake aria-hidden="true" className="size-5" />
            </span>
            <h2 className="font-display mt-5 text-3xl tracking-tight sm:text-4xl">
              Make your next money conversation a good one.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
              Start with what matters to both of you. The rest can take shape
              from there.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="shrink-0" size="lg" variant="gold">
              <a href="#calculators">
                Find your starting point{" "}
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            </Button>
            <Button
              asChild
              className="border-white/25 text-white hover:bg-white/10"
              size="lg"
              variant="outline"
            >
              <Link href="/consultation">Talk with our team</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
