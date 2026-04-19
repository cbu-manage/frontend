import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL &&
  process.env.NEXT_PUBLIC_API_URL !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL
    : "/api/v1";

const REFRESH_PATH = "/login/refresh";
const LOGIN_REDIRECT_PATH = "/login";

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
      if (!isAuthError || !original || original._retry || url.endsWith(REFRESH_PATH)) {
        if (isAuthError && url.endsWith(REFRESH_PATH)) {
          handleAuthFailure();
        }
        return Promise.reject(err);
      }

      original._retry = true;
      try {
        await refreshTokens();
      } catch (refreshErr) {
        handleAuthFailure();
        return Promise.reject(refreshErr);
      }
      return instance(original);
    },
  );
}

attachAuthInterceptor(api);
