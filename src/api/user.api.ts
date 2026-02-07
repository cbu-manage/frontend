import { api } from "./client";

export type VerifyUserRequest = {
  studentNumber: number;
  nickName: string;
};

export type UserInfo = {
  successMemberId: number;
  name: string;
  nickName: string;
  grade: string;
  major: string;
  phoneNumber: string;
  studentNumber: number;
};

export const userApi = {
  verify: (data: VerifyUserRequest) =>
    api.post<UserInfo>("/verify", data),
};
