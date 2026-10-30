import { BookOpen, ChartSpline, Target } from "lucide-react";

import { Eyebrow, SectionHeading } from "@/components/ui/typography";

const reasons = [
  {
    icon: BookOpen,
    title: "Learn Simply",
    description:
      "Financial concepts explained in plain language, so you understand every decision before you invest.",
  },
  {
    icon: ChartSpline,
    title: "Plan Smarter",
    description:
      "Interactive planners help you build goals for wealth, retirement, education, home, and financial freedom with confidence.",
  },
  {
    icon: Target,
    title: "Build Wealth Together",
    description:
      "Track your progress, stay consistent, and move closer to your financial goals with practical tools designed for every stage of life.",
  },
];

export function WhyWealthTogether() {
  return (
    <section className="bg-navy relative overflow-hidden text-white" id="why">
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-24 size-96 rounded-full border border-white/10"
      />
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-8 size-64 rounded-full border border-white/10"
      />
      <div className="px-content relative mx-auto grid max-w-7xl gap-12 py-20 sm:py-24 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
        <div>
          <Eyebrow className="text-gold">
            THE WEALTHTOGETHER DIFFERENCE
          </Eyebrow>

          <SectionHeading className="mt-3 max-w-lg text-3xl sm:text-4xl">
            Everything you need to build your financial future.
          </SectionHeading>

          <p className="mt-5 max-w-md text-base leading-7 text-white/65">
            Whether you're starting your first SIP, planning your dream home,
            preparing for retirement, or working toward financial freedom,
            WealthTogether gives you the knowledge and planning tools to make
            every financial decision with confidence.
          </p>
        </div>

        <div className="divide-y divide-white/15">
          {reasons.map(({ icon: Icon, title, description }, index) => (
            <article
              className="flex gap-5 py-6 first:pt-0 last:pb-0"
              key={title}
            >
              <span className="border-gold/30 bg-gold/10 text-gold grid size-11 shrink-0 place-items-center rounded-xl border">
                <Icon aria-hidden="true" className="size-5" />
              </span>

              <div>
                <p className="text-gold/80 text-xs font-medium tracking-widest">
                  0{index + 1}
                </p>

                <h3 className="font-display mt-1 text-xl">
                  {title}
                </h3>

                <p className="mt-2 max-w-lg text-sm leading-6 text-white/60">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}