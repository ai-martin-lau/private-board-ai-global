import type { AppLanguage, Profile } from "./types";

const PROFILE_KEY = "privateboard.profile";
const USER_KEY = "privateboard.userKey";
const LANGUAGE_KEY = "privateboard.language";
export const LANGUAGE_CHANGED_EVENT = "privateboard.languageChanged";

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, value); } catch { /* ignore quota */ }
}
function safeRemove(key: string): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}

export function loadProfile(): Profile | null {
  const raw = safeGet(PROFILE_KEY);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Profile;
    // Migrate legacy schema: topThreeValues used to be string[], now string
    const legacy = p as unknown as { topThreeValues?: unknown };
    if (Array.isArray(legacy.topThreeValues)) {
      p.topThreeValues = (legacy.topThreeValues as string[]).join("、");
    }
    return p;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile): void {
  safeSet(PROFILE_KEY, JSON.stringify(p));
}

export function clearProfile(): void {
  safeRemove(PROFILE_KEY);
}

export function loadUserKey(): string | null {
  return safeGet(USER_KEY);
}

export function saveUserKey(k: string): void {
  safeSet(USER_KEY, k);
}

export function clearUserKey(): void {
  safeRemove(USER_KEY);
}

export function loadLanguage(): AppLanguage {
  return safeGet(LANGUAGE_KEY) === "en" ? "en" : "zh";
}

export function saveLanguage(lang: AppLanguage): void {
  safeSet(LANGUAGE_KEY, lang);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: lang }));
  }
}
