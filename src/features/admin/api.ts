"use client";

export async function fetchAdminJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const data = (await response.json().catch(() => null)) as
    (T & { error?: string }) | null;
  if (!response.ok) {
    throw new Error(data?.error ?? "The request could not be completed.");
  }
  if (!data) throw new Error("The server returned an unreadable response.");
  return data;
}
