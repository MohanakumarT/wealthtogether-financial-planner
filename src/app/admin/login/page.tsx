import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { AdminLoginForm } from "@/features/admin/admin-login-form";
import { getAdminAccess } from "@/lib/server/admin-auth";

export const metadata = {
  title: "Admin sign in | WealthTogether",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminAccess()) redirect("/admin");
  return (
    <main className="bg-background grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="bg-navy relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 -bottom-32 size-[32rem] rounded-full border border-white/10" />
        <div className="border-gold/25 absolute -right-12 -bottom-16 size-[22rem] rounded-full border" />
        <Link className="relative flex items-center gap-3" href="/">
          <span className="text-gold grid size-11 place-items-center rounded-xl bg-white/10">
            <span className="font-display text-xl font-bold">W</span>
          </span>
          <span>
            <span className="block text-sm font-bold">WealthTogether</span>
            <span className="text-xs text-white/60">Investments</span>
          </span>
        </Link>
        <div className="relative max-w-xl pb-10">
          <p className="text-gold text-xs font-semibold tracking-[0.2em] uppercase">
            Private workspace
          </p>
          <h1 className="font-display mt-5 text-5xl leading-[1.08] tracking-tight">
            Every client relationship, thoughtfully managed.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/70">
            A secure space for the WealthTogether team to follow enquiries,
            consultations and financial plans.
          </p>
        </div>
        <p className="relative text-xs text-white/50">
          Authorized team members only · Private client records
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            className="text-muted-foreground hover:text-foreground mb-12 inline-flex items-center gap-2 text-xs font-semibold lg:hidden"
            href="/"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            WealthTogether Investments
          </Link>
          <div className="bg-accent text-primary mb-8 flex size-12 items-center justify-center rounded-2xl">
            <ShieldCheck aria-hidden="true" className="size-6" />
          </div>
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            Admin access
          </p>
          <h2 className="font-display mt-2 text-3xl tracking-tight">
            Sign in to your workspace
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            Use the administrator account assigned to you by a WealthTogether
            owner.
          </p>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
          <p className="text-muted-foreground mt-10 text-center text-xs">
            Having trouble? Contact your workspace owner.
          </p>
        </div>
      </section>
    </main>
  );
}
