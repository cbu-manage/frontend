import { api } from "./client";

export type MemberInfo = {
  id: number;
  role: string[];
  name: string;
  phoneNumber: string;
  major: string;
  grade: string;
  studentNumber: number;
  generation: number;
  note: string;
  due: boolean;
  email: string;
};

export const memberApi = {
  getById: (id: number) => api.get<MemberInfo>(`/member/${id}`),
};
