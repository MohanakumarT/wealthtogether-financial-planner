import {
  ArrowUpRight,
  CalendarCheck2,
  Landmark,
  MessageCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";  
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
          {/* Left Side */}
          <div>
            <div className="bg-accent text-accent-foreground mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold">
              <CalendarCheck2 className="size-4" />
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
                    <Landmark className="size-7" />
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
                      education and life goals. We help you create a practical
                      investment roadmap.
                    </p>
                  </div>
                </div>

                <div className="border-border mt-6 grid gap-3 border-t pt-5 sm:grid-cols-2">
                  <div className="bg-muted/60 flex items-start gap-3 rounded-xl p-3.5">
                    <ShieldCheck className="text-primary mt-0.5 size-4 shrink-0" />
                    <p className="text-muted-foreground text-xs leading-5">
                      Personalized financial guidance based on your goals.
                    </p>
                  </div>

                  <div className="bg-muted/60 flex items-start gap-3 rounded-xl p-3.5">
                    <CalendarCheck2 className="text-primary mt-0.5 size-4 shrink-0" />
                    <p className="text-muted-foreground text-xs leading-5">
                      Flexible consultation slots confirmed directly with you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Cards */}
            <div className="mt-9">
              <h2 className="text-foreground text-sm font-semibold">
                Talk with us directly
              </h2>

              <div className="mt-3 grid grid-cols-2 gap-4">
                {/* WhatsApp */}
                <Card>
                  <CardContent className="flex flex-col p-5">
  <div className="flex items-start gap-4">
    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
      <MessageCircle className="size-6" />
    </span>

    <div className="flex-1">
      <p className="text-foreground text-base font-semibold">
        WhatsApp
      </p>

      <p className="text-primary mt-1 text-sm font-medium">
        Chat with our advisory team
      </p>

      <p className="text-muted-foreground mt-1 text-xs">
        Quick replies • Consultation booking
      </p>
    </div>
  </div>

  <Button
    asChild
    variant="outline"
    size="sm"
    className="mt-5 w-full"
  >
    <a
      href={contact.whatsappHref}
      target="_blank"
      rel="noreferrer"
    >
      Open WhatsApp
      <ArrowUpRight className="ml-2 size-4" />
    </a>
  </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col p-5">
  <div className="flex items-start gap-4">
    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-yellow-500/10 text-yellow-600">
      <Mail className="size-6" />
    </span>

    <div className="flex-1">
      <p className="text-foreground text-base font-semibold">
        Email
      </p>

      <p className="text-primary mt-1 text-sm font-medium">
        Send us your enquiry
      </p>

      <p className="text-muted-foreground mt-1 text-xs">
        We usually reply within 24 hours.
      </p>
    </div>
  </div>

  <Button
    asChild
    variant="outline"
    size="sm"
    className="mt-5 w-full"
  >
    <a href={`mailto:${contact.email}`}>
      Send Email
      <ArrowUpRight className="ml-2 size-4" />
    </a>
  </Button>
</CardContent>
                </Card>
              </div>
            </div>

            {/* Steps */}
            <div className="mt-10">
              <h2 className="text-foreground text-sm font-semibold">
                What to expect
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="border-border border-t-2 pt-3"
                  >
                    <p className="text-primary text-xs font-semibold">
                      {step.number}
                    </p>

                    <h3 className="mt-2 text-sm font-semibold">
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

          {/* Right Side */}
          <div className="lg:sticky lg:top-24">
            <div className="mb-5 px-1">
              <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                Secure booking request
              </p>

              <h2 className="font-display mt-1 text-2xl tracking-tight sm:text-3xl">
                Request a consultation
              </h2>

              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Complete a few short steps so we can prepare for your
                consultation.
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