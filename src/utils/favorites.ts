const KEY = 'favorite_events';

function safeParse(json: string | null): string[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function getFavoriteIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  return new Set(safeParse(localStorage.getItem(KEY)));
}

export function isFavorite(id: string): boolean {
  return getFavoriteIds().has(id);
}

export function toggleFavorite(id: string): boolean {
  if (typeof window === 'undefined') return false;
  const set = getFavoriteIds();
  if (set.has(id)) set.delete(id);
  else set.add(id);
  localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  return set.has(id);
}

export function setFavorite(id: string, value: boolean): void {
  if (typeof window === 'undefined') return;
  const set = getFavoriteIds();
  if (value) set.add(id);
  else set.delete(id);
  localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
}