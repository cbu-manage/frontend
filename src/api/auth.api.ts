import { api } from "./client";

export type LoginRequest = {
  studentNumber: number;
  password: string;
};

export type LoginResponseData = {
  name: string;
  email: string | null;
  role: string;
};

export type MeResponseData = {
  userId: number;
  name: string;
  email: string | null;
  role: string;
  studentNumber: number;
  major: string;
  grade: string;
  generation: number;
};

export type MeResponse = ApiEnvelope<MeResponseData>;

export type ApiEnvelope<T> = {
  code: string;
  message: string;
  data: T;
};

export type LoginResponse = ApiEnvelope<LoginResponseData>;

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

export type ResetPasswordRequest = {
  studentNumber: number;
  email: string;
  authCode: string;
  newPassword: string;
};

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>("/login", data),

  logout: () => api.delete("/login"),

  refresh: () => api.post("/login/refresh"),

  me: () => api.get<MeResponse>("/login/me"),

  signup: (data: SignupRequest) => api.post("/login/signup", data),

  changePassword: (data: ChangePasswordRequest) =>
    api.patch("/login/password", data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post("/login/password/reset", data),
};
