import Link from "next/link";
import {
  ArrowUpRight,
  Instagram,
  Landmark,
  Linkedin,
  Mail,
  MessageCircle,
} from "lucide-react";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/features/contact/contact-form";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "Contact WealthTogether Investments by message, WhatsApp, Instagram, LinkedIn, or email.",
  path: "/contact",
});

function getHttpsLink(value: string | undefined, domain: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === domain || url.hostname.endsWith(`.${domain}`))
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function getContactChannels() {
  const email =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_CONSULTATION_EMAIL?.trim() ||
    "";
  const whatsapp =
    process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.trim() ||
    process.env.NEXT_PUBLIC_CONSULTATION_WHATSAPP?.trim() ||
    "";
  const digits = whatsapp.replace(/\D/g, "");
  const instagramUrl = getHttpsLink(
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    "instagram.com",
  );
  const linkedinUrl = getHttpsLink(
    process.env.NEXT_PUBLIC_LINKEDIN_URL,
    "linkedin.com",
  );

  return [
    {
      label: "WhatsApp",
      detail: digits.length >= 8 ? whatsapp : "Message us directly",
      action: digits.length >= 8 ? "Open WhatsApp" : "Use the contact form",
      href:
        digits.length >= 8
          ? `https://wa.me/${digits}?text=${encodeURIComponent("Hello, I have a question for WealthTogether Investments.")}`
          : "#contact-form",
      icon: MessageCircle,
      color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      external: true,
    },
    {
      label: "Instagram",
      detail: "Follow WealthTogether",
      action: instagramUrl ? "Open Instagram" : "Use the contact form",
      href: instagramUrl || "#contact-form",
      icon: Instagram,
      color: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
      external: true,
    },
    {
      label: "LinkedIn",
      detail: "Connect with WealthTogether",
      action: linkedinUrl ? "Open LinkedIn" : "Use the contact form",
      href: linkedinUrl || "#contact-form",
      icon: Linkedin,
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      external: true,
    },
    {
      label: "Email",
      detail: email.includes("@") ? email : "Send a private message",
      action: email.includes("@") ? "Write an email" : "Use the contact form",
      href: email.includes("@") ? `mailto:${email}` : "#contact-form",
      icon: Mail,
      color: "bg-accent text-accent-foreground",
      external: false,
    },
  ];
}

export default function ContactPage() {
  const channels = getContactChannels();

  return (
    <>
      <Navigation />
      <main>
        <section className="px-content mx-auto grid max-w-7xl gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(25rem,1fr)] lg:items-start lg:gap-16 lg:py-20">
          <div>
            <p className="text-primary mb-4 text-xs font-semibold tracking-[0.16em] uppercase">
              Contact WealthTogether
            </p>
            <h1 className="font-display max-w-xl text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              We’re here to help you find your next step.
            </h1>
            <p className="text-muted-foreground mt-5 max-w-xl text-base leading-7">
              Questions about a financial planning tool, your account, or
              working with our team? Choose a channel or send us a message.
            </p>

            <Card className="mt-8">
              <CardContent className="flex items-start gap-4 p-5 sm:p-6">
                <span className="bg-navy text-gold grid size-12 shrink-0 place-items-center rounded-2xl">
                  <Landmark aria-hidden="true" className="size-6" />
                </span>
                <div>
                  <p className="text-primary text-[11px] font-semibold tracking-[0.16em] uppercase">
                    WealthTogether Investments
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    We bring your planning questions, goals, and assumptions
                    into one clearer conversation.
                  </p>
                  <Button
                    asChild
                    className="mt-4 px-0"
                    size="sm"
                    variant="link"
                  >
                    <Link href="/consultation">
                      Request a consultation{" "}
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8">
              <h2 className="text-foreground text-sm font-semibold">
                Connect with us
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <Card key={channel.label}>
                      <CardContent className="flex h-full items-center gap-3 p-4">
                        <span
                          className={`grid size-10 shrink-0 place-items-center rounded-xl ${channel.color}`}
                        >
                          <Icon aria-hidden="true" className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground text-sm font-semibold">
                            {channel.label}
                          </p>
                          <p className="text-muted-foreground mt-0.5 truncate text-xs">
                            {channel.detail}
                          </p>
                          <a
                            className="text-primary mt-2 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                            href={channel.href}
                            rel={channel.external ? "noreferrer" : undefined}
                            target={
                              channel.external && !channel.href.startsWith("#")
                                ? "_blank"
                                : undefined
                            }
                          >
                            {channel.action}
                            <ArrowUpRight
                              aria-hidden="true"
                              className="size-3"
                            />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <Card
            className="border-border shadow-navy/5 shadow-xl"
            id="contact-form"
          >
            <CardHeader className="border-border border-b px-5 py-5 sm:px-7">
              <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                Send a message
              </p>
              <CardTitle className="font-display text-2xl tracking-tight sm:text-3xl">
                How can we help?
              </CardTitle>
              <p className="text-muted-foreground text-sm leading-6">
                Leave a few details and the team can get back to you by email.
              </p>
            </CardHeader>
            <CardContent className="p-5 sm:p-7">
              <ContactForm />
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </>
  );
}
