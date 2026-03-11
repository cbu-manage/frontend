import { api } from "./client";

export type ValidateUserRequest = {
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
  validateUser: (data: ValidateUserRequest) =>
    api.post<UserInfo>("/validate", data),
};
