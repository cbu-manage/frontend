import axios from "axios";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== "undefined"
      ? process.env.NEXT_PUBLIC_API_URL
      : "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 요청 인터셉터 (토큰 자동)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 (에러 공통처리)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API ERROR:", err.response?.data ?? err.message);
    return Promise.reject(err);
  }
);
