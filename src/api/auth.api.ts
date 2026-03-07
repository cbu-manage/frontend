import { api } from "./client";

export type LoginRequest = {
  studentNumber: number;
  password: string;
};

export type LoginResponse = {
  name: string;
  email: string | null;
  /** 로그인 성공 시 서버가 발급하는 JWT (있으면 저장 후 API 요청에 사용) */
  accessToken?: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
  studentNumber: number;
  nickname: string;
};

export type ChangePasswordRequest = {
  studentNumber: number;
  password: string;
};

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>("/login", data),

  logout: () => api.delete("/login"),

  signup: (data: SignupRequest) =>
    api.post("/login/signup", data),

  changePassword: (data: ChangePasswordRequest) =>
    api.patch("/login/password", data),
};
