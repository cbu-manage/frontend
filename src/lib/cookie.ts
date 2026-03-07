/**
 * 쿠키 읽기/쓰기 (토큰 등 저장용)
 * - path=/, SameSite=Lax, maxAge 7일
 */

const MAX_AGE_DAYS = 7;

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(
  name: string,
  value: string,
  maxAgeDays: number = MAX_AGE_DAYS
): void {
  if (typeof document === "undefined") return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function removeCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

/** authStore persist용 쿠키 키 */
const AUTH_STORE_COOKIE = "authStore";

export const authCookieStorage = {
  getItem: (): string | null => getCookie(AUTH_STORE_COOKIE),
  setItem: (_name: string, value: string): void =>
    setCookie(AUTH_STORE_COOKIE, value),
  removeItem: (): void => removeCookie(AUTH_STORE_COOKIE),
};

/** 쿠키에 저장된 auth state에서 accessToken만 꺼내기 (API 클라이언트 fallback용) */
export function getAccessTokenFromCookie(): string | null {
  const raw = getCookie(AUTH_STORE_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string | null } };
    const token = parsed?.state?.accessToken;
    return token && typeof token === "string" ? token : null;
  } catch {
    return null;
  }
}
