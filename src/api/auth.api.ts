import { api } from "./client";

export type LoginRequest = {
  studentNumber: number;
  password: string;
};

export type LoginResponse = {
  name: string;
  email: string | null;
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

  signup: (data: SignupRequest) =>
    api.post("/login/signup", data),

  changePassword: (data: ChangePasswordRequest) =>
    api.patch("/login/password", data),
};
