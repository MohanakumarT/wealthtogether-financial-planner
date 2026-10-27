import {
  ArrowUpRight,
  CalendarCheck2,
  Landmark,
  MessageCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ConsultationBookingWizard } from "@/features/consultation/components/booking-wizard";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Book a financial planning consultation",
  description:
    "Request a personal financial planning conversation with WealthTogether Investments.",
  path: "/consultation",
});

function getContactDetails() {
  const whatsapp =
    process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.trim() ||
    process.env.NEXT_PUBLIC_CONSULTATION_WHATSAPP?.trim() ||
    "";
  const email =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONSULTATION_EMAIL?.trim() ||
    "";
  const whatsappNumber = whatsapp.replace(/\D/g, "");
  return {
    email: email.includes("@") ? email : "",
    whatsapp: whatsappNumber.length >= 8 ? whatsapp : "",
    whatsappHref:
      whatsappNumber.length >= 8
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello, I’d like to request a financial planning consultation.")}`
        : "",
  };
}

const steps = [
  {
    number: "01",
    title: "Share what’s on your mind",
    description: "Choose a planning focus and a time that works for you.",
  },
  {
    number: "02",
    title: "We confirm the details",
    description:
      "The team will reply by email or WhatsApp to confirm availability.",
  },
  {
    number: "03",
    title: "Plan your next steps",
    description:
      "Bring your questions. We’ll make the conversation specific to your goals.",
  },
];

export default function ConsultationPage() {
  const contact = getContactDetails();

  return (
    <>
      <Navigation />
      <main>
        <section className="px-content mx-auto grid max-w-7xl gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(25rem,0.85fr)] lg:items-start lg:gap-16 lg:py-20">
          <div>
            <div className="bg-accent text-accent-foreground mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold">
              <CalendarCheck2 aria-hidden="true" className="size-4" />
              Consultation by request
            </div>
            <h1 className="font-display max-w-2xl text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Make your next financial decision with a clearer plan.
            </h1>
            <p className="text-muted-foreground mt-5 max-w-xl text-base leading-7 sm:text-lg">
              Request a personal conversation about the goals, trade-offs, and
              assumptions that matter to you.
            </p>

            <Card className="mt-9 overflow-hidden">
              <CardContent className="p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="bg-navy text-gold grid size-14 shrink-0 place-items-center rounded-2xl">
                    <Landmark aria-hidden="true" className="size-7" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-primary text-[11px] font-semibold tracking-[0.17em] uppercase">
                      WealthTogether Investments
                    </p>
                    <h2 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">
                      WealthTogether Advisory Team
                    </h2>
                    <p className="text-muted-foreground mt-3 text-sm leading-6">
                      Goal-based planning conversations for retirement, savings,
                      education, and life’s larger purchases. We’ll walk through
                      your questions and the assumptions behind your plan.
                    </p>
                  </div>
                </div>
                <div className="border-border mt-6 grid gap-3 border-t pt-5 sm:grid-cols-2">
                  <div className="bg-muted/60 flex items-start gap-3 rounded-xl p-3.5">
                    <ShieldCheck
                      aria-hidden="true"
                      className="text-primary mt-0.5 size-4 shrink-0"
                    />
                    <p className="text-muted-foreground text-xs leading-5">
                      Clear assumptions and educational planning support.
                    </p>
                  </div>
                  <div className="bg-muted/60 flex items-start gap-3 rounded-xl p-3.5">
                    <CalendarCheck2
                      aria-hidden="true"
                      className="text-primary mt-0.5 size-4 shrink-0"
                    />
                    <p className="text-muted-foreground text-xs leading-5">
                      Your preferred time is confirmed directly with you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-9">
              <h2 className="text-foreground text-sm font-semibold">
                Talk with us directly
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Card>
                  <CardContent className="flex h-full items-center gap-3 p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      <MessageCircle aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground text-sm font-semibold">
                        WhatsApp
                      </p>
                      {contact.whatsapp ? (
                        <a
                          className="text-muted-foreground hover:text-foreground mt-0.5 block truncate text-xs"
                          href={contact.whatsappHref}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {contact.whatsapp}
                        </a>
                      ) : (
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          Contact details coming soon
                        </p>
                      )}
                    </div>
                    {contact.whatsapp ? (
                      <a
                        aria-label="Contact us on WhatsApp"
                        className="text-primary"
                        href={contact.whatsappHref}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                      </a>
                    ) : null}
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex h-full items-center gap-3 p-4">
                    <span className="bg-accent text-accent-foreground grid size-10 shrink-0 place-items-center rounded-xl">
                      <Mail aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground text-sm font-semibold">
                        Email
                      </p>
                      {contact.email ? (
                        <a
                          className="text-muted-foreground hover:text-foreground mt-0.5 block truncate text-xs"
                          href={`mailto:${contact.email}`}
                        >
                          {contact.email}
                        </a>
                      ) : (
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          Contact details coming soon
                        </p>
                      )}
                    </div>
                    {contact.email ? (
                      <a
                        aria-label="Email WealthTogether"
                        className="text-primary"
                        href={`mailto:${contact.email}`}
                      >
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                      </a>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-foreground text-sm font-semibold">
                What to expect
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {steps.map((step) => (
                  <div
                    className="border-border border-t-2 pt-3"
                    key={step.number}
                  >
                    <p className="text-primary text-xs font-semibold">
                      {step.number}
                    </p>
                    <h3 className="text-foreground mt-2 text-sm font-semibold">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mt-1.5 text-xs leading-5">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="mb-5 px-1">
              <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                Secure booking request
              </p>
              <h2 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">
                Request a consultation
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Complete a few short steps to help us prepare for your
                conversation.
              </p>
            </div>
            <ConsultationBookingWizard />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
