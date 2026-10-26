const localFallback = "http://localhost:3000";

export function getSiteOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const isProductionBuild = process.env.NODE_ENV === "production";
  const configurationError =
    "Set NEXT_PUBLIC_SITE_URL to the canonical HTTPS site origin before building for production.";

  if (!configuredUrl) {
    if (isProductionBuild) throw new Error(configurationError);
    return localFallback;
  }

  try {
    const url = new URL(configuredUrl);
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username ||
      url.password
    ) {
      throw new Error(configurationError);
    }
    if (
      isProductionBuild &&
      (url.protocol !== "https:" ||
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname.endsWith(".example"))
    ) {
      throw new Error(configurationError);
    }
    return url.origin;
  } catch {
    if (isProductionBuild) throw new Error(configurationError);
    return localFallback;
  }
}

export function absoluteSiteUrl(path: string) {
  return new URL(path, getSiteOrigin()).toString();
}
