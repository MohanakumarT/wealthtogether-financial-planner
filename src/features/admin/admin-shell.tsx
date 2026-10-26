"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { AdminRole } from "@/lib/server/admin-auth";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: UsersRound },
  { href: "/admin/consultations", label: "Consultations", icon: CalendarDays },
  {
    href: "/admin/settings",
    label: "Admin settings",
    icon: Settings2,
    ownerOnly: true,
  },
];

export function AdminShell({
  children,
  role,
  email,
}: {
  children: React.ReactNode;
  role: AdminRole;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (response.ok) window.location.assign("/admin/login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-muted/45 min-h-screen lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-border bg-card hidden border-r lg:fixed lg:inset-y-0 lg:flex lg:w-[250px] lg:flex-col">
        <Brand />
        <Nav pathname={pathname} role={role} />
        <div className="border-border mt-auto border-t p-4">
          <div className="mb-3 min-w-0">
            <p className="truncate text-sm font-semibold">
              {email || "Administrator"}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs capitalize">
              {role} access
            </p>
          </div>
          <SignOut busy={busy} onClick={signOut} />
        </div>
      </aside>
      <div className="min-w-0 lg:col-start-2">
        <header className="border-border bg-background/95 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur sm:px-6 lg:hidden">
          <Brand compact />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              aria-expanded={open}
              aria-label={open ? "Close navigation" : "Open navigation"}
              onClick={() => setOpen(!open)}
              size="icon"
              variant="ghost"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </header>
        {open ? (
          <div className="border-border bg-card fixed inset-x-0 top-16 z-20 border-b p-4 shadow-lg lg:hidden">
            <Nav
              pathname={pathname}
              role={role}
              onNavigate={() => setOpen(false)}
            />
            <div className="border-border mt-4 border-t pt-4">
              <p className="text-muted-foreground mb-3 text-xs">
                {email} · {role}
              </p>
              <SignOut busy={busy} onClick={signOut} />
            </div>
          </div>
        ) : null}
        <header className="border-border bg-background/80 hidden h-14 items-center justify-end border-b px-8 lg:flex">
          <span className="text-muted-foreground mr-auto text-xs font-medium">
            Private client workspace
          </span>
          <ThemeToggle />
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      className={`flex items-center gap-3 ${compact ? "" : "border-border border-b px-5 py-5"}`}
      href="/admin"
    >
      <span className="bg-navy text-gold grid size-10 shrink-0 place-items-center rounded-xl">
        <span className="font-display text-lg font-bold">W</span>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-tight">
          WealthTogether
        </span>
        <span className="text-muted-foreground mt-1 block text-[10px] font-semibold tracking-[0.16em] uppercase">
          Admin workspace
        </span>
      </span>
    </Link>
  );
}

function Nav({
  pathname,
  role,
  onNavigate,
}: {
  pathname: string;
  role: AdminRole;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Admin navigation" className="space-y-1 p-3">
      {navItems
        .filter((item) => !item.ownerOnly || role === "owner")
        .map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              href={href}
              key={href}
              onClick={onNavigate}
            >
              <Icon aria-hidden="true" className="size-[18px]" />
              {label}
            </Link>
          );
        })}
    </nav>
  );
}

function SignOut({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <Button
      className="w-full justify-start"
      disabled={busy}
      onClick={onClick}
      variant="outline"
    >
      <LogOut aria-hidden="true" className="size-4" />
      {busy ? "Signing out…" : "Sign out"}
    </Button>
  );
}
