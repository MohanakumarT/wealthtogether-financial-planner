"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bot,
  ChartNoAxesCombined,
  FileText,
  Goal,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/components/auth/auth-provider";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Goal },
  { href: "/portfolio", label: "Portfolio", icon: ChartNoAxesCombined },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/assistant", label: "Assistant", icon: Bot },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function ClientWorkspaceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { identity, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const name = identity?.profile.full_name || identity?.email || "Your account";

  async function handleSignOut() {
    setBusy(true);
    setError("");
    try {
      await signOut();
      window.location.assign("/");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not sign out.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-muted/45 min-h-screen lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-border bg-card hidden border-r lg:fixed lg:inset-y-0 lg:flex lg:w-[250px] lg:flex-col">
        <Brand />
        <WorkspaceNav pathname={pathname} />
        <div className="border-border mt-auto border-t p-4">
          <p className="text-foreground truncate text-sm font-semibold">
            {name}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Client account</p>
          <Button
            className="mt-4 w-full justify-start"
            disabled={busy}
            onClick={handleSignOut}
            variant="outline"
          >
            <LogOut aria-hidden="true" className="size-4" />
            {busy ? "Signing out…" : "Sign out"}
          </Button>
          {error ? (
            <p className="text-destructive mt-2 text-xs" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </aside>
      <div className="min-w-0 lg:col-start-2">
        <header className="border-border bg-background/95 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur sm:px-6 lg:hidden">
          <Brand compact />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMenuOpen((value) => !value)}
              size="icon"
              variant="ghost"
            >
              {menuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </header>
        {menuOpen ? (
          <div className="border-border bg-card fixed inset-x-0 top-16 z-20 border-b p-3 shadow-lg lg:hidden">
            <WorkspaceNav
              pathname={pathname}
              onNavigate={() => setMenuOpen(false)}
            />
            <div className="border-border mt-3 border-t px-3 pt-3">
              <p className="text-muted-foreground mb-3 truncate text-xs">
                {name}
              </p>
              <Button
                className="w-full justify-start"
                disabled={busy}
                onClick={handleSignOut}
                variant="outline"
              >
                <LogOut aria-hidden="true" className="size-4" />
                {busy ? "Signing out…" : "Sign out"}
              </Button>
              {error ? (
                <p className="text-destructive mt-2 text-xs" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
        <header className="border-border bg-background/80 hidden h-14 items-center justify-between border-b px-8 lg:flex">
          <span className="text-muted-foreground text-xs font-medium">
            Your private planning workspace
          </span>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground max-w-64 truncate text-xs">
              {name}
            </span>
            <ThemeToggle />
          </div>
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
      href="/dashboard"
    >
      <span className="bg-navy text-gold grid size-10 shrink-0 place-items-center rounded-xl">
        <span className="font-display text-lg font-bold">W</span>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-tight">
          WealthTogether
        </span>
        <span className="text-muted-foreground mt-1 block text-[10px] font-semibold tracking-[0.16em] uppercase">
          Financial planner
        </span>
      </span>
    </Link>
  );
}

function WorkspaceNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Client navigation" className="space-y-1 p-3">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
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
