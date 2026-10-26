export function safeRedirectPath(
  path: string | null | undefined,
  fallback = "/dashboard",
) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  try {
    const destination = new URL(path, "https://wealthtogether.invalid");
    if (destination.origin !== "https://wealthtogether.invalid") {
      return fallback;
    }
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return fallback;
  }
}
