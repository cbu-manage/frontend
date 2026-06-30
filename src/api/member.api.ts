import { api } from "./client";

export type MemberInfo = {
  id: number;
  role: string; // 서버 MemberDTO.role (단수 문자열, 예: "ROLE_USER")
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

export type MembersResponse = {
  code: string;
  message: string;
  data: {
    totalElements: number;
    totalPages: number;
    size: number;
    content: MemberInfo[];
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
};

export const memberApi = {
  getById: (id: number) => api.get<MemberInfo>(`/member/${id}`),

  getAll: (page = 0, size = 10) =>
    api.get<MembersResponse>("/members", { params: { page, size } }),

  updateDue: (id: number, due: boolean) =>
    api.patch(`/members/${id}/due`, { due }),

  activate: (id: number) => api.patch(`/members/${id}/activate`),
};
