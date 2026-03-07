/**
 * 이미지 업로드 API
 * @see POST /api/image/upload
 * base path가 /api 이므로 별도 instance 사용
 */
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const getImageBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (base && base !== "undefined" && base.endsWith("/api/v1")) {
    return base.replace(/\/api\/v1$/, "");
  }
  return "";
};

const imageApiBase = axios.create({
  baseURL: getImageBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },
});

imageApiBase.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      useAuthStore.getState().accessToken ??
      localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const imageApi = {
  /** 사진 업로드 */
  upload: (formData: FormData) =>
    imageApiBase.post("/api/image/upload", formData),
};
