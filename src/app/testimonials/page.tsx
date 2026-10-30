import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Client Testimonials",
  description:
    "Read real client experiences and see how WealthTogether Investments has helped individuals and families improve their financial confidence.",
  path: "/testimonials",
});

export default function TestimonialsPage() {
  return (
    <>
      <Navigation />

      <main>

        {/* Hero Section */}
        <section className="bg-navy text-white">
          <div className="px-content mx-auto max-w-7xl py-24 text-center">

            <p className="text-gold text-sm font-semibold tracking-[0.25em] uppercase">
              Trusted by Our Clients
            </p>

            <h1 className="mt-5 text-5xl font-bold tracking-tight">
              Real Stories.
              <br />
              Real Financial Confidence.
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/70">
              Discover how WealthTogether Investments has helped individuals
              and families understand money, start investing confidently, and
              make smarter financial decisions through simple financial
              education.
            </p>

          </div>
        </section>


{/* Statistics */}
<section className="bg-background">
  <div className="px-content mx-auto max-w-7xl py-16">
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

      <div className="rounded-2xl border p-8 text-center">
        <h2 className="text-primary text-4xl font-bold">10+</h2>
        <p className="mt-2 font-semibold">Verified Reviews</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Genuine feedback from our clients.
        </p>
      </div>

      <div className="rounded-2xl border p-8 text-center">
        <h2 className="text-primary text-4xl font-bold">15K+</h2>
        <p className="mt-2 font-semibold">Community</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Growing financial learning community.
        </p>
      </div>

      <div className="rounded-2xl border p-8 text-center">
        <h2 className="text-primary text-4xl font-bold">40L+</h2>
        <p className="mt-2 font-semibold">Educational Views</p>
        <p className="text-muted-foreground mt-2 text-sm">
          People reached through financial education.
        </p>
      </div>

      <div className="rounded-2xl border p-8 text-center">
        <h2 className="text-primary text-4xl font-bold">100%</h2>
        <p className="mt-2 font-semibold">Education First</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Simple, practical and unbiased financial learning.
        </p>
      </div>

    </div>
  </div>
</section>

<div className="mt-12 grid gap-6 md:grid-cols-3">

  {/* Testimonial 1 */}
  <div className="bg-navy border border-gold/20 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-gold/60">

    <div className="text-gold text-xl tracking-wider">
      ★★★★★
    </div>

    <blockquote className="mt-5 leading-8 italic text-white/80">
      &ldquo;Thank you for the clear step-by-step guidance on financial awareness
      and planning. Everything was explained simply, and I now feel much more
      confident about my financial decisions.&rdquo;
    </blockquote>

    <div className="mt-6 border-t border-white/10 pt-4">
      <h3 className="text-lg font-semibold text-white">
        Kiruthika
      </h3>

      <p className="text-sm text-gold">
        Financial Awareness Session
      </p>
    </div>

  </div>

  {/* Testimonial 2 */}
  <div className="bg-navy border border-gold/20 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-gold/60">

    <div className="text-gold text-xl tracking-wider">
      ★★★★★
    </div>

    <blockquote className="mt-5 leading-8 italic text-white/80">
      &ldquo;The session helped me understand the basics of mutual funds in a
      simple way. I now have better clarity on planning investments for my
      children&apos;s future.&rdquo;
    </blockquote>

    <div className="mt-6 border-t border-white/10 pt-4">
      <h3 className="text-lg font-semibold text-white">
        Mani Megalai
      </h3>

      <p className="text-sm text-gold">
        Children&apos;s Future Planning
      </p>
    </div>

  </div>

  {/* Testimonial 3 */}
  <div className="bg-navy border border-gold/20 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-gold/60">

    <div className="text-gold text-xl tracking-wider">
      ★★★★★
    </div>

    <blockquote className="mt-5 leading-8 italic text-white/80">
      &ldquo;I was completely new to mutual fund investing. The SIP process was
      explained patiently, and I now understand how to start investing with
      confidence.&rdquo;
    </blockquote>

    <div className="mt-6 border-t border-white/10 pt-4">
      <h3 className="text-lg font-semibold text-white">
        Kutty Ettiyan
      </h3>

      <p className="text-sm text-gold">
        First SIP Experience
      </p>
    </div>
  </div>
</div>

{/* More Client Experiences */}
<section className="bg-background">
  <div className="px-content mx-auto max-w-7xl py-20">

    <div className="text-center">
      <h2 className="text-3xl font-bold">
        More Client Experiences
      </h2>

      <p className="text-muted-foreground mt-3">
        Every conversation is different, but our goal remains the same:
        helping people make confident financial decisions.
      </p>
    </div>

    <div className="mt-12 grid gap-6 md:grid-cols-3">

      {/* Card 1 */}
      <div className="rounded-2xl border p-7">
        <div className="text-yellow-500 text-xl">★★★★★</div>

        <blockquote className="mt-5 text-muted-foreground leading-7 italic">
          &ldquo;The mutual fund consultation was informative and professional.
          My questions were answered patiently, and I understood both the
          benefits and the risks before investing.&rdquo;
        </blockquote>

        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold">Vishwa</h3>
          <p className="text-sm text-muted-foreground">
            Mutual Fund Consultation
          </p>
        </div>
      </div>

      {/* Card 2 */}
      <div className="rounded-2xl border p-7">
        <div className="text-yellow-500 text-xl">★★★★★</div>

        <blockquote className="mt-5 text-muted-foreground leading-7 italic">
          &ldquo;The emergency fund session was simple and practical.
          I now understand how much I should save and why it is important
          before investing.&rdquo;
        </blockquote>

        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold">Kamalesh</h3>
          <p className="text-sm text-muted-foreground">
            Emergency Fund Planning
          </p>
        </div>
      </div>

      {/* Card 3 */}
      <div className="rounded-2xl border p-7">
        <div className="text-yellow-500 text-xl">★★★★★</div>

        <blockquote className="mt-5 text-muted-foreground leading-7 italic">
          &ldquo;I gained a clear understanding of retirement planning,
          long-term investing, and why starting early makes such a big
          difference. Thank you for the guidance.&rdquo;
        </blockquote>

        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold">Anu Raaji</h3>
          <p className="text-sm text-muted-foreground">
            Retirement Planning
          </p>
        </div>
      </div>

    </div>

  </div>
</section>

{/* CTA */}
<section className="py-20">
  <div className="px-content mx-auto max-w-7xl">
    <div className="bg-navy relative overflow-hidden rounded-3xl px-10 py-16 text-white md:px-16">

      <div
        aria-hidden="true"
        className="absolute -top-20 -right-20 h-72 w-72 rounded-full border border-white/10"
      />

      <div
        aria-hidden="true"
        className="absolute top-10 right-10 h-56 w-56 rounded-full border border-white/10"
      />

      <div className="relative flex flex-col items-center text-center">

        <p className="text-gold text-sm font-semibold tracking-[0.25em] uppercase">
          Ready to Start?
        </p>

        <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          Let&apos;s Build Your Financial Future Together
        </h2>

        <p className="mt-6 max-w-2xl text-lg text-white/70">
          Whether you&apos;re planning your first SIP, your child&apos;s education,
          retirement, or long-term wealth creation, we&apos;re here to guide you
          with clarity and confidence.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">

          <a
            href="/consultation"
            className="rounded-xl bg-gold px-8 py-4 font-semibold text-black transition hover:opacity-90"
          >
            Book a Consultation
          </a>

          <a
            href="/calculators"
            className="rounded-xl border border-white/20 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
          >
            Explore Calculators
          </a>

        </div>

      </div>

    </div>
  </div>
</section>

     </main>

      <Footer />
    </>
  );
}
