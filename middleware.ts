import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

const adminRoutes = ["/admin", "/crm", "/client-management"];
const clientRoutes = [
  "/dashboard",
  "/profile",
  "/goals",
  "/portfolio",
  "/reports",
  "/assistant",
  "/family",
  "/history",
];
const rememberCookieName = "wt-remember";
const rememberedSessionMaxAge = 60 * 60 * 24 * 30;

function matchesRoute(pathname: string, roots: string[]) {
  return roots.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}

type RefreshedCookie = { name: string; value: string; options: CookieOptions };

function redirectWithCookies(destination: URL, cookies: RefreshedCookie[]) {
  const response = NextResponse.redirect(destination);
  cookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

export async function middleware(request: NextRequest) {
  const env = getSupabasePublicEnv();
  if (!env) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  let refreshedCookies: RefreshedCookie[] = [];
  const rememberMe = request.cookies.get(rememberCookieName)?.value === "1";
  const rememberedCookieOptions: CookieOptions = {
    path: "/",
    maxAge: rememberedSessionMaxAge,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
  };
  if (rememberMe) {
    response.cookies.set(rememberCookieName, "1", rememberedCookieOptions);
  }
  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        refreshedCookies = cookiesToSet.map(({ name, value, options }) => ({
          name,
          value,
          options: {
            ...options,
            sameSite: "lax",
            secure: request.nextUrl.protocol === "https:",
            maxAge:
              options?.maxAge === 0
                ? 0
                : rememberMe
                  ? rememberedSessionMaxAge
                  : undefined,
          },
        }));
        if (rememberMe) {
          refreshedCookies.push({
            name: rememberCookieName,
            value: "1",
            options: rememberedCookieOptions,
          });
        }
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        refreshedCookies.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const adminLogin = pathname === "/admin/login";
  const isAdminRoute = matchesRoute(pathname, adminRoutes) && !adminLogin;
  const isClientRoute = matchesRoute(pathname, clientRoutes);
  const protectedRoute = isAdminRoute || isClientRoute;
  const adminRecord =
    user && protectedRoute
      ? await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle()
      : null;
  const isAdmin = Boolean(adminRecord?.data && !adminRecord.error);

  if (adminLogin && isAdmin) {
    return redirectWithCookies(
      new URL("/admin", request.url),
      refreshedCookies,
    );
  }

  if (isAdminRoute) {
    if (!user) {
      const destination = new URL("/admin/login", request.url);
      destination.searchParams.set(
        "next",
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
      );
      return redirectWithCookies(destination, refreshedCookies);
    }
    if (!adminRecord || adminRecord.error || !isAdmin) {
      return redirectWithCookies(
        new URL("/dashboard?error=admin_required", request.url),
        refreshedCookies,
      );
    }
  }

  if (isClientRoute) {
    if (!user) {
      const destination = new URL("/auth/login", request.url);
      destination.searchParams.set(
        "next",
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
      );
      return redirectWithCookies(destination, refreshedCookies);
    }
    if (adminRecord?.error) {
      return redirectWithCookies(
        new URL("/auth/login?error=access_check_failed", request.url),
        refreshedCookies,
      );
    }
    if (isAdmin) {
      return redirectWithCookies(
        new URL("/admin", request.url),
        refreshedCookies,
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/crm/:path*",
    "/client-management/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/goals/:path*",
    "/portfolio/:path*",
    "/reports/:path*",
    "/assistant/:path*",
    "/family/:path*",
    "/history/:path*",
    "/api/auth/:path*",
  ],
};
