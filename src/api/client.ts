import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { getAccessTokenFromCookie } from "@/lib/cookie";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL &&
    process.env.NEXT_PUBLIC_API_URL !== "undefined"
      ? process.env.NEXT_PUBLIC_API_URL
      : "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 요청 인터셉터 (토큰: store → 쿠키 순으로 사용)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      useAuthStore.getState().accessToken ?? getAccessTokenFromCookie();
    if (token) config.headers.Authorization = `${token}`;
  }
  return config;
});

// 응답 인터셉터 (에러 공통처리)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API ERROR:", err.response?.data ?? err.message);
    return Promise.reject(err);
  },
);
