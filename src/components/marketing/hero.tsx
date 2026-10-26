import { ArrowDown, ArrowRight, Check, Heart, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const priorities = [
  "A first home",
  "A confident retirement",
  "More room to grow",
];

export function Hero() {
  return (
    <section
      className="bg-navy relative isolate overflow-hidden text-white"
      id="hero"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 78% 42%, rgba(212,175,55,.2), transparent 34%), radial-gradient(ellipse at 12% 100%, rgba(54,91,141,.3), transparent 40%)",
        }}
      />
      <div className="px-content relative mx-auto grid max-w-7xl items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-10 lg:py-24">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium tracking-wide text-white/80">
            <Sparkles aria-hidden="true" className="text-gold size-3.5" /> A
            more considered kind of financial planning
          </p>
          <h1 className="font-display text-5xl leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Make a plan for <span className="text-gold italic">the life</span>{" "}
            you share.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
            Bring your goals into focus, find a way forward together, and make
            each money decision feel a little more intentional.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="gold">
              <a href="#calculators">
                Explore planning tools{" "}
                <ArrowRight aria-hidden="true" className="size-4" />
              </a>
            </Button>
            <Button
              asChild
              className="border-white/25 text-white hover:bg-white/10"
              size="lg"
              variant="outline"
            >
              <a href="#why">Why WealthTogether</a>
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-3 text-sm text-white/60">
            <span className="flex -space-x-2">
              <span className="border-navy text-navy grid size-8 place-items-center rounded-full border-2 bg-[#e8d5c4] text-[10px] font-semibold">
                A
              </span>
              <span className="border-navy text-navy grid size-8 place-items-center rounded-full border-2 bg-[#d9e1ed] text-[10px] font-semibold">
                J
              </span>
            </span>
            <span>A shared view for two points of view.</span>
          </div>
        </div>

        <div
          aria-label="Illustrative preview of a shared financial plan"
          className="relative mx-auto w-full max-w-[31rem]"
          role="img"
        >
          <div
            aria-hidden="true"
            className="bg-gold/10 absolute -inset-8 rounded-full blur-3xl"
          />
          <div className="relative rounded-[1.75rem] border border-white/15 bg-white/[0.08] p-3 shadow-2xl shadow-black/25 backdrop-blur sm:p-4">
            <div className="bg-background text-foreground rounded-[1.25rem] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-xs font-medium">
                    YOUR SHARED PLAN
                  </p>
                  <p className="font-display mt-1.5 text-2xl tracking-tight">
                    What matters next
                  </p>
                </div>
                <span className="bg-accent text-accent-foreground grid size-10 place-items-center rounded-full">
                  <Heart aria-hidden="true" className="size-4" />
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {priorities.map((priority, index) => (
                  <div
                    className="border-border bg-card flex items-center gap-3 rounded-xl border px-3.5 py-3"
                    key={priority}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-lg ${index === 0 ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}
                    >
                      {index === 0 ? (
                        <Sparkles aria-hidden="true" className="size-4" />
                      ) : (
                        <Check aria-hidden="true" className="size-4" />
                      )}
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      {priority}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      In focus
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-navy mt-5 rounded-xl p-4 text-white sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-white/60">
                      A little progress, consistently
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      Your next step is taking shape
                    </p>
                  </div>
                  <ArrowDown
                    aria-hidden="true"
                    className="text-gold size-4 rotate-[-45deg]"
                  />
                </div>
                <svg
                  aria-hidden="true"
                  className="mt-4 h-16 w-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 320 64"
                >
                  <defs>
                    <linearGradient id="hero-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#D4AF37" stopOpacity=".3" />
                      <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 52 C30 47 36 48 62 38 S101 45 126 32 S165 39 190 25 S226 34 249 18 S286 26 320 5 V64 H0 Z"
                    fill="url(#hero-fill)"
                  />
                  <path
                    d="M0 52 C30 47 36 48 62 38 S101 45 126 32 S165 39 190 25 S226 34 249 18 S286 26 320 5"
                    fill="none"
                    stroke="#D4AF37"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </div>
            <p className="px-2 pt-3 text-center text-[10px] text-white/50">
              Illustrative preview · Your plan starts with your priorities
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
