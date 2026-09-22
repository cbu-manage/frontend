/**
 * 이미지 업로드 API
 * @see POST /api/image/upload
 * base path가 /api 이므로 별도 instance 사용
 */
import axios from "axios";
import { attachAuthInterceptor } from "./client";
import { publicEnv } from "@/lib/env";

const getImageBaseUrl = () => {
  const base = publicEnv.apiUrl;
  if (base && base.endsWith("/api/v1")) {
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

attachAuthInterceptor(imageApiBase);

export const imageApi = {
  /** 사진 업로드 */
  upload: (formData: FormData) =>
    imageApiBase.post("/api/image/upload", formData),
};
