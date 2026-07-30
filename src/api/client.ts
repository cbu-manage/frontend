import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { publicEnv } from "@/lib/env";

const API_BASE_URL = publicEnv.apiUrl ?? "/api/v1";

const REFRESH_PATH = "/login/refresh";
const LOGIN_REDIRECT_PATH = "/login";

// 비로그인 상태에서 호출하는 공개 엔드포인트. 401이 나도 토큰 갱신/로그인 리다이렉트 대상이 아니다.
function isPublicAuthPath(url: string): boolean {
  return (
    url.includes("/mail/") ||
    url.endsWith("/login/password/reset") ||
    url.endsWith("/login/signup") ||
    url.endsWith("/validate") ||
    // 지원서(비로그인 지원자) — 서버가 이메일 인증 실패를 401로 반환한다.
    // /admin/applications(운영진용)는 매칭되면 안 되므로 세그먼트 단위로 제한.
    /^\/applications([/?]|$)/.test(url)
  );
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

let refreshing: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  if (!refreshing) {
    refreshing = api
      .post(REFRESH_PATH, null, { _retry: true } as RetriableConfig)
      .then(() => undefined)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

function handleAuthFailure(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === LOGIN_REDIRECT_PATH) return;
  import("@/store/userStore").then(({ useUserStore }) => {
    useUserStore.getState().clearUser();
    window.location.href = LOGIN_REDIRECT_PATH;
  });
}

function applyServerMessage(err: AxiosError): AxiosError {
  const msg = (err.response?.data as { message?: string } | undefined)?.message;
  if (msg) err.message = msg;
  return err;
}

/**
 * 401 → /login/refresh → 원요청 재시도. refresh 실패 시 로그아웃 + /login 이동.
 */
export function attachAuthInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      const status = err.response?.status;
      const original = err.config as RetriableConfig | undefined;
      const url = original?.url ?? "";

      const isAuthError = status === 401 || status === 403;
      if (
        !isAuthError ||
        !original ||
        original._retry ||
        url.endsWith(REFRESH_PATH) ||
        isPublicAuthPath(url)
      ) {
        if (isAuthError && url.endsWith(REFRESH_PATH)) {
          handleAuthFailure();
        }
        return Promise.reject(applyServerMessage(err));
      }

      original._retry = true;
      try {
        await refreshTokens();
      } catch (refreshErr) {
        handleAuthFailure();
        return Promise.reject(applyServerMessage(refreshErr as AxiosError));
      }
      return instance(original);
    },
  );
}

attachAuthInterceptor(api);
