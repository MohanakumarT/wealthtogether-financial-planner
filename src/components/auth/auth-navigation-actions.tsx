"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

export function AuthNavigationActions({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  const { identity, loading } = useAuth();
  if (mobile) {
    if (loading) {
      return <span aria-hidden="true" className="size-7 shrink-0" />;
    }
    return identity ? (
      <Link
        className="text-muted-foreground shrink-0 text-xs"
        href={identity.role === "admin" ? "/admin" : "/dashboard"}
      >
        {identity.role === "admin" ? "Admin workspace" : "My dashboard"}
      </Link>
    ) : (
      <div className="flex shrink-0 items-center gap-4">
        <Link
          className="text-muted-foreground shrink-0 text-xs"
          href="/auth/login"
        >
          Login
        </Link>
        <Link
          className="text-foreground shrink-0 text-xs font-semibold"
          href="/auth/sign-up"
        >
          Register
        </Link>
      </div>
    );
  }

  if (loading) return null;
  return identity ? (
    <Button asChild size="sm" variant="gold">
      <Link href={identity.role === "admin" ? "/admin" : "/dashboard"}>
        {identity.role === "admin" ? "Admin workspace" : "My dashboard"}
      </Link>
    </Button>
  ) : (
    <>
      <Button
        asChild
        className="hidden sm:inline-flex"
        size="sm"
        variant="ghost"
      >
        <Link href="/auth/login">Login</Link>
      </Button>
      <Button
        asChild
        className="hidden sm:inline-flex"
        size="sm"
        variant="gold"
      >
        <Link href="/auth/sign-up">Register</Link>
      </Button>
    </>
  );
}
