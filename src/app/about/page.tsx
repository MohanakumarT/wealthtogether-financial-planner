import Image from "next/image";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";

export default function AboutPage() {
  return (
    <>
      <Navigation />

      <main>
        {/* =========================
            Hero Section
        ========================== */}
        <section className="px-content mx-auto max-w-7xl py-16 lg:py-24">
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            About WealthTogether
          </p>

          <h1 className="font-display mt-4 max-w-3xl text-5xl leading-tight tracking-tight lg:text-6xl">
            Helping individuals and families make better financial decisions.
          </h1>

          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
            WealthTogether Investments exists to simplify investing,
            financial planning, and wealth creation through education,
            transparency, and long-term guidance.
          </p>
        </section>

        {/* =========================
            Founder Section
        ========================== */}
        <section className="border-y border-border bg-muted/30">
          <div className="px-content mx-auto grid max-w-7xl gap-12 py-20 lg:grid-cols-[320px_1fr] lg:items-center">

            <div className="flex justify-center">
              <Image
                src="/Founder.jpeg"
                alt="Mohana Kumar"
                width={260}
                height={360}
                className="rounded-3xl object-cover shadow-xl"
              />
            </div>

            <div>
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                Meet the Founder
              </p>

              <h2 className="font-display mt-3 text-4xl tracking-tight">
                Mohana Kumar
              </h2>

              <p className="text-muted-foreground mt-2 text-lg">
                Founder • WealthTogether Investments
              </p>

              <p className="text-muted-foreground mt-6 leading-8">
                I started WealthTogether with one simple belief—
                financial education should be simple, practical,
                and accessible to everyone.
              </p>

              <p className="text-muted-foreground mt-4 leading-8">
                My goal is to help individuals and families make
                confident financial decisions through education,
                goal-based planning, and long-term investing.
              </p>

              <p className="text-muted-foreground mt-4 leading-8">
                Whether you're starting your first SIP,
                planning your child's education,
                preparing for retirement,
                or building long-term wealth,
                WealthTogether is here to guide you with
                clarity and confidence.
              </p>
            </div>

          </div>
        </section>

        {/* =========================
            Mission & Vision
        ========================== */}
        <section className="px-content mx-auto max-w-7xl py-20">
          <div className="text-center">

            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              Our Purpose
            </p>

            <h2 className="font-display mt-3 text-4xl tracking-tight">
              Mission & Vision
            </h2>

            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl leading-7">
              Everything we do is guided by one purpose—
              helping people make confident financial decisions
              through education and long-term planning.
            </p>

          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">

            {/* Mission */}

            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">

              <p className="text-primary text-xs font-semibold uppercase tracking-[0.15em]">
                Our Mission
              </p>

              <h3 className="mt-4 text-2xl font-semibold">
                Simplify Financial Planning
              </h3>

              <p className="text-muted-foreground mt-5 leading-8">
                To make investing, mutual funds,
                insurance, retirement planning,
                and wealth creation simple,
                transparent, and accessible
                for everyone through practical
                education and personalized guidance.
              </p>

            </div>

            {/* Vision */}

            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">

              <p className="text-primary text-xs font-semibold uppercase tracking-[0.15em]">
                Our Vision
              </p>

              <h3 className="mt-4 text-2xl font-semibold">
                Build Financially Confident Families
              </h3>

              <p className="text-muted-foreground mt-5 leading-8">
                We envision a future where thousands
                of individuals and families confidently
                manage their money, achieve financial
                freedom, and create lasting wealth
                for future generations.
              </p>

            </div>
          </div>
        </section>
                {/* =========================
            Core Values
        ========================== */}
        <section className="border-y border-border bg-muted/30">
          <div className="px-content mx-auto max-w-7xl py-20">

            <div className="text-center">
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                Our Values
              </p>

              <h2 className="font-display mt-3 text-4xl tracking-tight">
                What We Believe
              </h2>

              <p className="text-muted-foreground mx-auto mt-4 max-w-2xl leading-7">
                Every recommendation and every conversation is built on these
                core principles.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-5">

              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold">
                  📚 Education First
                </h3>

                <p className="text-muted-foreground mt-4 text-sm leading-7">
                  We believe informed investors make better financial
                  decisions.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold">
                  🤝 Trust
                </h3>

                <p className="text-muted-foreground mt-4 text-sm leading-7">
                  Long-term relationships are built through honesty,
                  transparency, and consistency.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold">
                  🎯 Goal-Based Planning
                </h3>

                <p className="text-muted-foreground mt-4 text-sm leading-7">
                  Every investment should support a meaningful financial goal.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold">
                  📈 Long-Term Wealth
                </h3>

                <p className="text-muted-foreground mt-4 text-sm leading-7">
                  Sustainable wealth is created through patience,
                  discipline, and consistency.
                </p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold">
                  ❤️ Client First
                </h3>

                <p className="text-muted-foreground mt-4 text-sm leading-7">
                  Every recommendation starts with understanding your needs.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* =========================
            Why Choose WealthTogether
        ========================== */}

        <section className="px-content mx-auto max-w-7xl py-20">

          <div className="text-center">

            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              Why Choose Us
            </p>

            <h2 className="font-display mt-3 text-4xl tracking-tight">
              More Than Investment Advice
            </h2>

          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">

            <div className="rounded-3xl border border-border p-8">
              <h3 className="text-xl font-semibold">
                Personalized Financial Planning
              </h3>

              <p className="text-muted-foreground mt-4 leading-8">
                We help create financial roadmaps tailored to your goals,
                income, family needs, and future aspirations.
              </p>
            </div>

            <div className="rounded-3xl border border-border p-8">
              <h3 className="text-xl font-semibold">
                Simple Investment Education
              </h3>

              <p className="text-muted-foreground mt-4 leading-8">
                We simplify complex financial concepts so you understand every
                step of your investment journey.
              </p>
            </div>

            <div className="rounded-3xl border border-border p-8">
              <h3 className="text-xl font-semibold">
                Goal-Based Investing
              </h3>

              <p className="text-muted-foreground mt-4 leading-8">
                Every SIP and investment recommendation is aligned with your
                financial objectives.
              </p>
            </div>

            <div className="rounded-3xl border border-border p-8">
              <h3 className="text-xl font-semibold">
                Ongoing Support
              </h3>

              <p className="text-muted-foreground mt-4 leading-8">
                We continue supporting your financial journey through reviews,
                education, and long-term guidance.
              </p>
            </div>

          </div>

        </section>
                {/* =========================
            Our Impact
        ========================== */}
        <section className="border-y border-border bg-muted/30">
          <div className="px-content mx-auto max-w-7xl py-20">

            <div className="text-center">
              <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                Our Impact
              </p>

              <h2 className="font-display mt-3 text-4xl tracking-tight">
                Growing Together
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

  <div className="rounded-3xl border border-border bg-card p-8 text-center">
    <h3 className="text-primary text-5xl font-bold">100+</h3>
    <p className="text-muted-foreground mt-3">
      Educational Posts
    </p>
  </div>

  <div className="rounded-3xl border border-border bg-card p-8 text-center">
    <h3 className="text-primary text-5xl font-bold">15K+</h3>
    <p className="text-muted-foreground mt-3">
      Community Members
    </p>
  </div>

  <div className="rounded-3xl border border-border bg-card p-8 text-center">
    <h3 className="text-primary text-5xl font-bold">1:1</h3>
    <p className="text-muted-foreground mt-3">
      Financial Consultation
    </p>
  </div>

  <div className="rounded-3xl border border-border bg-card p-8 text-center">
    <h3 className="text-primary text-5xl font-bold">Trusted</h3>
    <p className="text-muted-foreground mt-3">
     Financial Guidance
    </p>
  </div>

</div>

          </div>
        </section>

        {/* =========================
            CTA
        ========================== */}

        <section className="px-content mx-auto max-w-5xl py-24">

          <div className="rounded-[4xl] border border-border bg-card px-8 py-16 text-center shadow-sm">

            <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
              Ready to Start?
            </p>

            <h2 className="font-display mt-4 text-4xl tracking-tight lg:text-5xl">
              Let&apos;s Build Your Financial Future Together
            </h2>

            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8">
              Whether you&apos;re starting your investment journey,
              planning for retirement,
              saving for your child&apos;s education,
              or building long-term wealth,
              we&apos;re here to guide you every step of the way.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">

              <a
                href="/consultation"
                className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Book a Consultation
              </a>

              <a
                href="/contact"
                className="rounded-xl border border-border px-8 py-3 text-sm font-semibold transition hover:bg-muted"
              >
                Contact Us
              </a>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}