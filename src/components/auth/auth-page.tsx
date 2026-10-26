import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Landmark, ShieldCheck } from "lucide-react";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";

export function AuthPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main className="px-content mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-12 py-12 lg:grid-cols-[1fr_0.8fr] lg:py-20">
        <section className="hidden max-w-xl lg:block">
          <Link
            className="text-muted-foreground hover:text-foreground mb-12 inline-flex items-center gap-2 text-sm transition-colors"
            href="/"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to home
          </Link>
          <div className="bg-navy shadow-navy/15 relative overflow-hidden rounded-[2rem] p-10 text-white shadow-2xl xl:p-14">
            <div className="bg-gold/10 absolute -top-24 -right-24 size-72 rounded-full blur-2xl" />
            <div className="relative">
              <span className="bg-gold/15 text-gold mb-10 grid size-12 place-items-center rounded-2xl">
                <Landmark aria-hidden="true" className="size-6" />
              </span>
              <p className="text-gold mb-4 text-xs font-semibold tracking-[0.2em] uppercase">
                A more considered future
              </p>
              <h2 className="font-display max-w-md text-4xl leading-tight tracking-tight xl:text-5xl">
                Make room for the life you’re planning.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
                Keep your planning profile in one place and return to your
                financial goals whenever you’re ready.
              </p>
              <div className="mt-10 flex items-center gap-3 border-t border-white/15 pt-6 text-sm text-white/80">
                <ShieldCheck aria-hidden="true" className="text-gold size-5" />
                Secure account access powered by Supabase
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="border-border bg-card shadow-navy/5 rounded-3xl border p-6 shadow-xl sm:p-9">
            <div className="mb-7 lg:hidden">
              <Link
                className="text-muted-foreground inline-flex items-center gap-2 text-sm"
                href="/"
              >
                <ArrowLeft aria-hidden="true" className="size-4" /> Back to home
              </Link>
            </div>
            <p className="text-accent-foreground bg-accent mb-4 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase">
              {eyebrow}
            </p>
            <h1 className="font-display text-foreground text-3xl tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              {description}
            </p>
            <div className="mt-8">{children}</div>
          </div>
          <p className="text-muted-foreground mx-auto mt-5 max-w-sm text-center text-xs leading-5">
            Your account details are used to provide account access and profile
            features. Never share your password with anyone.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
