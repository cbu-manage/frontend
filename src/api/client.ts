import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { getAccessTokenFromCookie, getCookie } from "@/lib/cookie";

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

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      useAuthStore.getState().accessToken ?? getAccessTokenFromCookie();
    if (token) {
      config.headers.Authorization = `${token}`;
      config.headers["ACCESS_TOKEN"] = token;
    }
    const directCookie = getCookie("ACCESS_TOKEN");
    if (!token && directCookie) {
      config.headers.Authorization = `${directCookie}`;
      config.headers["ACCESS_TOKEN"] = directCookie;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err),
);
