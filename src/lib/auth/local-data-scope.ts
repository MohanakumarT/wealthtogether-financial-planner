const ownerStorageKey = "wealthtogether.local-data-owner.v1";

export function getUserStorageKey(key: string, userId: string) {
  return `${key}.user.${encodeURIComponent(userId)}`;
}

export function claimLegacyLocalData(userId: string) {
  if (typeof window === "undefined" || !userId) return false;
  try {
    const owner = window.localStorage.getItem(ownerStorageKey);
    if (owner) return owner === userId;
    window.localStorage.setItem(ownerStorageKey, userId);
    return true;
  } catch {
    return false;
  }
}
